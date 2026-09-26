import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { requireVerifiedArtist } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { authedMutation, authedQuery } from "./lib/functions";
import { GENRES, hasUnknownGenre } from "./lib/genres";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";

const PEAKS_LEN = TRACK_PEAK_BUCKETS;
const MAX_TAGS = 12;
const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;
const TAG_MAX = 32;

const visibilityValidator = v.union(
  v.literal("public"),
  v.literal("supporters")
);

const stateValidator = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published")
);

const releaseRowValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  state: stateValidator,
  visibility: visibilityValidator,
  hidden: v.boolean(),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
  genre: v.string(),
  publishedAt: v.union(v.number(), v.null()),
  publishAt: v.union(v.number(), v.null()),
  createdAt: v.number(),
});

type FileCtx = QueryCtx | MutationCtx;

function assertPeaks(peaks: number[]) {
  if (peaks.length !== PEAKS_LEN) {
    raise(ERROR_CODES.INVALID, `Peaks must be exactly ${PEAKS_LEN} values`);
  }
  for (const peak of peaks) {
    if (!Number.isFinite(peak) || peak < 0 || peak > 1) {
      raise(ERROR_CODES.INVALID, "Each peak must be between 0 and 1");
    }
  }
}

function normalizeTags(tags: string[]): string[] {
  const cleaned = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .map((tag) => tag.slice(0, TAG_MAX));
  return [...new Set(cleaned)].slice(0, MAX_TAGS);
}

function normalizeTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    raise(ERROR_CODES.INVALID, "Title is required");
  }
  if (trimmed.length > TITLE_MAX) {
    raise(
      ERROR_CODES.INVALID,
      `Title must be ${TITLE_MAX} characters or fewer`
    );
  }
  return trimmed;
}

function normalizeDescription(
  description: string | undefined
): string | undefined {
  if (description === undefined) {
    return undefined;
  }
  const trimmed = description.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (trimmed.length > DESCRIPTION_MAX) {
    raise(
      ERROR_CODES.INVALID,
      `Description must be ${DESCRIPTION_MAX} characters or fewer`
    );
  }
  return trimmed;
}

function assertGenre(genre: string) {
  if (hasUnknownGenre([genre])) {
    raise(ERROR_CODES.INVALID, "Pick a genre from the list");
  }
}

async function requireOwnedArtwork(
  ctx: MutationCtx,
  artistId: Doc<"artists">["_id"],
  artworkFileId: Id<"files">
) {
  const art = await ctx.db.get(artworkFileId);
  if (art === null || art.artistId !== artistId || art.kind !== "artwork") {
    raise(ERROR_CODES.INVALID, "Artwork file is not yours");
  }
}

function assertTrackHasArtwork(track: Doc<"tracks">) {
  if (track.artworkFileId === undefined) {
    raise(ERROR_CODES.INVALID, "Cover art is required");
  }
}

async function requireOwnTrack(
  ctx: MutationCtx | QueryCtx,
  trackId: Id<"tracks">
): Promise<{ artist: Doc<"artists">; track: Doc<"tracks"> }> {
  const { artist } = await requireVerifiedArtist(ctx);
  const track = await ctx.db.get(trackId);
  if (track === null || track.artistId !== artist._id) {
    raise(ERROR_CODES.NOT_PERMITTED);
  }
  return { artist, track };
}

async function toReleaseRow(ctx: FileCtx, track: Doc<"tracks">) {
  return {
    trackId: track._id,
    title: track.title,
    state: track.state,
    visibility: track.visibility,
    hidden: track.hidden,
    artworkUrl: await fileUrl(ctx, track.artworkFileId),
    durationMs: track.durationMs,
    genre: track.genre,
    publishedAt: track.publishedAt ?? null,
    publishAt: track.publishAt ?? null,
    createdAt: track.createdAt,
  };
}

async function registerOwnedFile(
  ctx: MutationCtx,
  args: {
    storageId: Id<"_storage">;
    kind: "trackAudio" | "artwork";
    contentType: string;
    sizeBytes: number;
  }
): Promise<Id<"files">> {
  const { profile, artist } = await requireVerifiedArtist(ctx);
  if (args.kind === "trackAudio" && !args.contentType.startsWith("audio/")) {
    raise(ERROR_CODES.INVALID, "Upload an audio file");
  }
  if (args.kind === "artwork" && !args.contentType.startsWith("image/")) {
    raise(ERROR_CODES.INVALID, "Upload an image file");
  }
  if (args.sizeBytes <= 0) {
    raise(ERROR_CODES.INVALID, "File is empty");
  }
  return await ctx.db.insert("files", {
    storageId: args.storageId,
    kind: args.kind,
    ownerProfileId: profile._id,
    artistId: artist._id,
    contentType: args.contentType,
    sizeBytes: args.sizeBytes,
    createdAt: Date.now(),
  });
}

async function publishTrack(
  ctx: MutationCtx,
  track: Doc<"tracks">,
  publishedAt: number
): Promise<null> {
  await ctx.db.patch(track._id, {
    state: "published",
    publishedAt,
    publishAt: undefined,
  });
  // Embedding + follower pushes land in later tickets.
  return null;
}

export const listGenres = authedQuery({
  args: {},
  returns: v.array(v.string()),
  handler: async () => {
    return [...GENRES];
  },
});

export const listMine = authedQuery({
  args: {
    filter: v.optional(
      v.union(
        v.literal("all"),
        v.literal("scheduled"),
        v.literal("published"),
        v.literal("draft"),
        v.literal("hidden")
      )
    ),
  },
  returns: v.array(releaseRowValidator),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const filter = args.filter ?? "all";
    const rows: Doc<"tracks">[] = [];
    for (const state of ["published", "scheduled", "draft"] as const) {
      const batch = await ctx.db
        .query("tracks")
        .withIndex("by_artist_state_publishedAt", (q) =>
          q.eq("artistId", artist._id).eq("state", state)
        )
        .collect();
      rows.push(...batch);
    }
    const filtered = rows.filter((track) => {
      if (track.releaseId !== undefined) {
        return false;
      }
      if (filter === "all") {
        return true;
      }
      if (filter === "hidden") {
        return track.hidden;
      }
      return track.state === filter && !track.hidden;
    });
    filtered.sort((a, b) => {
      const aTime = a.publishedAt ?? a.publishAt ?? a.createdAt;
      const bTime = b.publishedAt ?? b.publishAt ?? b.createdAt;
      return bTime - aTime;
    });
    const result = [];
    for (const track of filtered) {
      result.push(await toReleaseRow(ctx, track));
    }
    return result;
  },
});

export const getMine = authedQuery({
  args: { trackId: v.id("tracks") },
  returns: v.union(
    v.object({
      trackId: v.id("tracks"),
      title: v.string(),
      description: v.union(v.string(), v.null()),
      tags: v.array(v.string()),
      genre: v.string(),
      visibility: visibilityValidator,
      state: stateValidator,
      hidden: v.boolean(),
      durationMs: v.number(),
      artworkUrl: v.union(v.string(), v.null()),
      publishAt: v.union(v.number(), v.null()),
      publishedAt: v.union(v.number(), v.null()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { track } = await requireOwnTrack(ctx, args.trackId);
    return {
      trackId: track._id,
      title: track.title,
      description: track.description ?? null,
      tags: track.tags,
      genre: track.genre,
      visibility: track.visibility,
      state: track.state,
      hidden: track.hidden,
      durationMs: track.durationMs,
      artworkUrl: await fileUrl(ctx, track.artworkFileId),
      publishAt: track.publishAt ?? null,
      publishedAt: track.publishedAt ?? null,
    };
  },
});

export const generateUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireVerifiedArtist(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const registerAudio = authedMutation({
  args: {
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    return await registerOwnedFile(ctx, { ...args, kind: "trackAudio" });
  },
});

export const registerArtwork = authedMutation({
  args: {
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    return await registerOwnedFile(ctx, { ...args, kind: "artwork" });
  },
});

export const createDraft = authedMutation({
  args: {
    title: v.string(),
    audioFileId: v.id("files"),
    artworkFileId: v.id("files"),
    visibility: visibilityValidator,
    durationMs: v.number(),
    peaks: v.array(v.number()),
    tags: v.array(v.string()),
    description: v.optional(v.string()),
    genre: v.string(),
  },
  returns: v.id("tracks"),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    assertPeaks(args.peaks);
    assertGenre(args.genre);
    if (args.durationMs <= 0) {
      raise(ERROR_CODES.INVALID, "Duration must be greater than zero");
    }
    const audio = await ctx.db.get(args.audioFileId);
    if (
      audio === null ||
      audio.artistId !== artist._id ||
      audio.kind !== "trackAudio"
    ) {
      raise(ERROR_CODES.INVALID, "Audio file is not yours");
    }
    await requireOwnedArtwork(ctx, artist._id, args.artworkFileId);
    return await ctx.db.insert("tracks", {
      artistId: artist._id,
      title: normalizeTitle(args.title),
      audioFileId: args.audioFileId,
      artworkFileId: args.artworkFileId,
      visibility: args.visibility,
      state: "draft",
      durationMs: args.durationMs,
      peaks: args.peaks,
      tags: normalizeTags(args.tags),
      description: normalizeDescription(args.description),
      genre: args.genre,
      hidden: false,
      createdAt: Date.now(),
    });
  },
});

export const update = authedMutation({
  args: {
    trackId: v.id("tracks"),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    genre: v.string(),
    visibility: visibilityValidator,
    artworkFileId: v.optional(v.id("files")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { artist, track } = await requireOwnTrack(ctx, args.trackId);
    assertGenre(args.genre);
    const patch: {
      title: string;
      description: string | undefined;
      tags: string[];
      genre: string;
      visibility: "public" | "supporters";
      artworkFileId?: Id<"files">;
    } = {
      title: normalizeTitle(args.title),
      description: normalizeDescription(args.description),
      tags: normalizeTags(args.tags),
      genre: args.genre,
      visibility: args.visibility,
    };
    if (args.artworkFileId !== undefined) {
      await requireOwnedArtwork(ctx, artist._id, args.artworkFileId);
      patch.artworkFileId = args.artworkFileId;
    } else if (track.artworkFileId === undefined) {
      raise(ERROR_CODES.INVALID, "Cover art is required");
    }
    await ctx.db.patch(args.trackId, patch);
    return null;
  },
});

export const setHidden = authedMutation({
  args: {
    trackId: v.id("tracks"),
    hidden: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnTrack(ctx, args.trackId);
    await ctx.db.patch(args.trackId, { hidden: args.hidden });
    return null;
  },
});

export const publishNow = authedMutation({
  args: { trackId: v.id("tracks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { track } = await requireOwnTrack(ctx, args.trackId);
    if (track.state === "published") {
      return null;
    }
    assertTrackHasArtwork(track);
    return await publishTrack(ctx, track, Date.now());
  },
});

export const schedule = authedMutation({
  args: {
    trackId: v.id("tracks"),
    publishAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { track } = await requireOwnTrack(ctx, args.trackId);
    if (track.state === "published") {
      raise(ERROR_CODES.INVALID, "Published releases cannot be scheduled");
    }
    assertTrackHasArtwork(track);
    const now = Date.now();
    if (args.publishAt <= now + 15_000) {
      raise(ERROR_CODES.INVALID, "Pick a time at least 15 seconds from now");
    }
    await ctx.db.patch(track._id, {
      state: "scheduled",
      publishAt: args.publishAt,
      publishedAt: undefined,
    });
    await ctx.scheduler.runAt(
      args.publishAt,
      internal.studioTracks.publishScheduled,
      { trackId: track._id }
    );
    return null;
  },
});

export const cancelSchedule = authedMutation({
  args: { trackId: v.id("tracks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { track } = await requireOwnTrack(ctx, args.trackId);
    if (track.state !== "scheduled") {
      return null;
    }
    await ctx.db.patch(track._id, {
      state: "draft",
      publishAt: undefined,
    });
    return null;
  },
});

export const publishScheduled = internalMutation({
  args: { trackId: v.id("tracks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (track === null) {
      return null;
    }
    if (track.state !== "scheduled") {
      return null;
    }
    const now = Date.now();
    if (track.publishAt !== undefined && track.publishAt > now) {
      return null;
    }
    return await publishTrack(ctx, track, now);
  },
});

/** Hourly safety net for missed scheduled publishes (e.g. after a deploy). */
export const publishDueScheduled = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("tracks")
      .withIndex("by_state_publishAt", (q) => q.eq("state", "scheduled"))
      .collect();
    let published = 0;
    for (const track of due) {
      if (track.publishAt !== undefined && track.publishAt <= now) {
        await publishTrack(ctx, track, now);
        published += 1;
      }
    }
    return published;
  },
});
