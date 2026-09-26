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
const MIN_EP_TRACKS = 2;
const MAX_EP_TRACKS = 6;
const MIN_ALBUM_TRACKS = 7;

const visibilityValidator = v.union(
  v.literal("public"),
  v.literal("supporters")
);

const stateValidator = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published")
);

const typeValidator = v.union(v.literal("ep"), v.literal("album"));

const releaseRowValidator = v.object({
  kind: v.literal("release"),
  releaseId: v.id("releases"),
  title: v.string(),
  type: typeValidator,
  state: stateValidator,
  visibility: visibilityValidator,
  hidden: v.boolean(),
  artworkUrl: v.union(v.string(), v.null()),
  trackCount: v.number(),
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

function assertTypeTrackCount(type: "ep" | "album", count: number) {
  if (type === "ep" && (count < MIN_EP_TRACKS || count > MAX_EP_TRACKS)) {
    raise(ERROR_CODES.INVALID, "An EP needs 2 to 6 tracks");
  }
  if (type === "album" && count < MIN_ALBUM_TRACKS) {
    raise(ERROR_CODES.INVALID, "An album needs at least 7 tracks");
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

async function requireOwnRelease(
  ctx: MutationCtx | QueryCtx,
  releaseId: Id<"releases">
): Promise<{ artist: Doc<"artists">; release: Doc<"releases"> }> {
  const { artist } = await requireVerifiedArtist(ctx);
  const release = await ctx.db.get(releaseId);
  if (release === null || release.artistId !== artist._id) {
    raise(ERROR_CODES.NOT_PERMITTED);
  }
  return { artist, release };
}

async function memberTracks(
  ctx: FileCtx,
  releaseId: Id<"releases">
): Promise<Doc<"tracks">[]> {
  const rows = await ctx.db
    .query("tracks")
    .withIndex("by_release_position", (q) => q.eq("releaseId", releaseId))
    .collect();
  rows.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return rows;
}

async function toReleaseRow(ctx: FileCtx, release: Doc<"releases">) {
  const members = await memberTracks(ctx, release._id);
  return {
    kind: "release" as const,
    releaseId: release._id,
    title: release.title,
    type: release.type,
    state: release.state,
    visibility: release.visibility,
    hidden: release.hidden,
    artworkUrl: await fileUrl(ctx, release.artworkFileId),
    trackCount: members.length,
    genre: release.genre,
    publishedAt: release.publishedAt ?? null,
    publishAt: release.publishAt ?? null,
    createdAt: release.createdAt,
  };
}

async function publishRelease(
  ctx: MutationCtx,
  release: Doc<"releases">,
  publishedAt: number
): Promise<null> {
  const members = await memberTracks(ctx, release._id);
  await ctx.db.patch(release._id, {
    state: "published",
    publishedAt,
    publishAt: undefined,
  });
  for (const track of members) {
    await ctx.db.patch(track._id, {
      state: "published",
      publishedAt,
      publishAt: undefined,
    });
  }
  return null;
}

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
    const rows: Doc<"releases">[] = [];
    for (const state of ["published", "scheduled", "draft"] as const) {
      const batch = await ctx.db
        .query("releases")
        .withIndex("by_artist_state_publishedAt", (q) =>
          q.eq("artistId", artist._id).eq("state", state)
        )
        .collect();
      rows.push(...batch);
    }
    const filtered = rows.filter((release) => {
      if (filter === "all") {
        return true;
      }
      if (filter === "hidden") {
        return release.hidden;
      }
      return release.state === filter && !release.hidden;
    });
    filtered.sort((a, b) => {
      const aTime = a.publishedAt ?? a.publishAt ?? a.createdAt;
      const bTime = b.publishedAt ?? b.publishAt ?? b.createdAt;
      return bTime - aTime;
    });
    const result = [];
    for (const release of filtered) {
      result.push(await toReleaseRow(ctx, release));
    }
    return result;
  },
});

export const getMine = authedQuery({
  args: { releaseId: v.id("releases") },
  returns: v.union(
    v.object({
      releaseId: v.id("releases"),
      title: v.string(),
      type: typeValidator,
      description: v.union(v.string(), v.null()),
      tags: v.array(v.string()),
      genre: v.string(),
      visibility: visibilityValidator,
      state: stateValidator,
      hidden: v.boolean(),
      artworkUrl: v.union(v.string(), v.null()),
      publishAt: v.union(v.number(), v.null()),
      publishedAt: v.union(v.number(), v.null()),
      tracks: v.array(
        v.object({
          trackId: v.id("tracks"),
          title: v.string(),
          position: v.number(),
          durationMs: v.number(),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { release } = await requireOwnRelease(ctx, args.releaseId);
    const members = await memberTracks(ctx, release._id);
    return {
      releaseId: release._id,
      title: release.title,
      type: release.type,
      description: release.description ?? null,
      tags: release.tags,
      genre: release.genre,
      visibility: release.visibility,
      state: release.state,
      hidden: release.hidden,
      artworkUrl: await fileUrl(ctx, release.artworkFileId),
      publishAt: release.publishAt ?? null,
      publishedAt: release.publishedAt ?? null,
      tracks: members.map((track) => ({
        trackId: track._id,
        title: track.title,
        position: track.position ?? 0,
        durationMs: track.durationMs,
      })),
    };
  },
});

const memberInput = v.object({
  title: v.string(),
  audioFileId: v.id("files"),
  durationMs: v.number(),
  peaks: v.array(v.number()),
});

export const createDraft = authedMutation({
  args: {
    title: v.string(),
    type: typeValidator,
    artworkFileId: v.id("files"),
    visibility: visibilityValidator,
    tags: v.array(v.string()),
    description: v.optional(v.string()),
    genre: v.string(),
    tracks: v.array(memberInput),
  },
  returns: v.id("releases"),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    assertGenre(args.genre);
    assertTypeTrackCount(args.type, args.tracks.length);
    await requireOwnedArtwork(ctx, artist._id, args.artworkFileId);
    const now = Date.now();
    const releaseId = await ctx.db.insert("releases", {
      artistId: artist._id,
      title: normalizeTitle(args.title),
      type: args.type,
      artworkFileId: args.artworkFileId,
      visibility: args.visibility,
      state: "draft",
      description: normalizeDescription(args.description),
      genre: args.genre,
      tags: normalizeTags(args.tags),
      hidden: false,
      createdAt: now,
    });
    for (let index = 0; index < args.tracks.length; index += 1) {
      const member = args.tracks[index];
      if (member === undefined) {
        continue;
      }
      assertPeaks(member.peaks);
      if (member.durationMs <= 0) {
        raise(ERROR_CODES.INVALID, "Duration must be greater than zero");
      }
      const audio = await ctx.db.get(member.audioFileId);
      if (
        audio === null ||
        audio.artistId !== artist._id ||
        audio.kind !== "trackAudio"
      ) {
        raise(ERROR_CODES.INVALID, "Audio file is not yours");
      }
      await ctx.db.insert("tracks", {
        artistId: artist._id,
        title: normalizeTitle(member.title),
        audioFileId: member.audioFileId,
        artworkFileId: args.artworkFileId,
        visibility: args.visibility,
        state: "draft",
        durationMs: member.durationMs,
        peaks: member.peaks,
        tags: [],
        genre: args.genre,
        hidden: false,
        releaseId,
        position: index,
        createdAt: now,
      });
    }
    return releaseId;
  },
});

export const update = authedMutation({
  args: {
    releaseId: v.id("releases"),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    genre: v.string(),
    visibility: visibilityValidator,
    artworkFileId: v.optional(v.id("files")),
    tracks: v.optional(
      v.array(
        v.object({
          trackId: v.id("tracks"),
          title: v.string(),
        })
      )
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { artist, release } = await requireOwnRelease(ctx, args.releaseId);
    assertGenre(args.genre);
    let artworkFileId = release.artworkFileId;
    if (args.artworkFileId !== undefined) {
      await requireOwnedArtwork(ctx, artist._id, args.artworkFileId);
      artworkFileId = args.artworkFileId;
    }
    await ctx.db.patch(release._id, {
      title: normalizeTitle(args.title),
      description: normalizeDescription(args.description),
      tags: normalizeTags(args.tags),
      genre: args.genre,
      visibility: args.visibility,
      artworkFileId,
    });
    const members = await memberTracks(ctx, release._id);
    const titleById = new Map(
      (args.tracks ?? []).map((row) => [row.trackId, row.title] as const)
    );
    for (const track of members) {
      const nextTitle = titleById.get(track._id);
      await ctx.db.patch(track._id, {
        visibility: args.visibility,
        genre: args.genre,
        artworkFileId,
        ...(nextTitle !== undefined
          ? { title: normalizeTitle(nextTitle) }
          : {}),
      });
    }
    return null;
  },
});

async function reindexPositions(
  ctx: MutationCtx,
  releaseId: Id<"releases">
): Promise<Doc<"tracks">[]> {
  const members = await memberTracks(ctx, releaseId);
  for (let index = 0; index < members.length; index += 1) {
    const track = members[index];
    if (track === undefined) {
      continue;
    }
    if (track.position !== index) {
      await ctx.db.patch(track._id, { position: index });
    }
  }
  return members;
}

export const reorderTracks = authedMutation({
  args: {
    releaseId: v.id("releases"),
    orderedTrackIds: v.array(v.id("tracks")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { release } = await requireOwnRelease(ctx, args.releaseId);
    const members = await memberTracks(ctx, release._id);
    if (args.orderedTrackIds.length !== members.length) {
      raise(
        ERROR_CODES.INVALID,
        "Track list is out of date — refresh and try again"
      );
    }
    const memberIds = new Set(members.map((track) => track._id));
    for (const trackId of args.orderedTrackIds) {
      if (!memberIds.has(trackId)) {
        raise(ERROR_CODES.INVALID, "Track does not belong to this release");
      }
    }
    if (new Set(args.orderedTrackIds).size !== args.orderedTrackIds.length) {
      raise(ERROR_CODES.INVALID, "Duplicate tracks in order");
    }
    for (let index = 0; index < args.orderedTrackIds.length; index += 1) {
      const trackId = args.orderedTrackIds[index];
      if (trackId === undefined) {
        continue;
      }
      await ctx.db.patch(trackId, { position: index });
    }
    return null;
  },
});

export const addTrack = authedMutation({
  args: {
    releaseId: v.id("releases"),
    title: v.string(),
    audioFileId: v.id("files"),
    durationMs: v.number(),
    peaks: v.array(v.number()),
  },
  returns: v.id("tracks"),
  handler: async (ctx, args) => {
    const { artist, release } = await requireOwnRelease(ctx, args.releaseId);
    assertPeaks(args.peaks);
    if (args.durationMs <= 0) {
      raise(ERROR_CODES.INVALID, "Duration must be greater than zero");
    }
    const members = await memberTracks(ctx, release._id);
    assertTypeTrackCount(release.type, members.length + 1);
    const audio = await ctx.db.get(args.audioFileId);
    if (
      audio === null ||
      audio.artistId !== artist._id ||
      audio.kind !== "trackAudio"
    ) {
      raise(ERROR_CODES.INVALID, "Audio file is not yours");
    }
    const trackId = await ctx.db.insert("tracks", {
      artistId: artist._id,
      title: normalizeTitle(args.title),
      audioFileId: args.audioFileId,
      artworkFileId: release.artworkFileId,
      visibility: release.visibility,
      state: release.state,
      durationMs: args.durationMs,
      peaks: args.peaks,
      tags: [],
      genre: release.genre,
      hidden: release.hidden,
      releaseId: release._id,
      position: members.length,
      publishAt: release.publishAt,
      publishedAt: release.publishedAt,
      createdAt: Date.now(),
    });
    return trackId;
  },
});

export const removeTrack = authedMutation({
  args: {
    releaseId: v.id("releases"),
    trackId: v.id("tracks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { release } = await requireOwnRelease(ctx, args.releaseId);
    const members = await memberTracks(ctx, release._id);
    const track = members.find((row) => row._id === args.trackId);
    if (track === undefined) {
      raise(ERROR_CODES.INVALID, "Track does not belong to this release");
    }
    assertTypeTrackCount(release.type, members.length - 1);
    await ctx.db.delete(args.trackId);
    await reindexPositions(ctx, release._id);
    return null;
  },
});

export const setHidden = authedMutation({
  args: {
    releaseId: v.id("releases"),
    hidden: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { release } = await requireOwnRelease(ctx, args.releaseId);
    await ctx.db.patch(release._id, { hidden: args.hidden });
    const members = await memberTracks(ctx, release._id);
    for (const track of members) {
      await ctx.db.patch(track._id, { hidden: args.hidden });
    }
    return null;
  },
});

export const publishNow = authedMutation({
  args: { releaseId: v.id("releases") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { release } = await requireOwnRelease(ctx, args.releaseId);
    if (release.state === "published") {
      return null;
    }
    const members = await memberTracks(ctx, release._id);
    assertTypeTrackCount(release.type, members.length);
    return await publishRelease(ctx, release, Date.now());
  },
});

export const schedule = authedMutation({
  args: {
    releaseId: v.id("releases"),
    publishAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { release } = await requireOwnRelease(ctx, args.releaseId);
    if (release.state === "published") {
      raise(ERROR_CODES.INVALID, "Published releases cannot be scheduled");
    }
    const members = await memberTracks(ctx, release._id);
    assertTypeTrackCount(release.type, members.length);
    const now = Date.now();
    if (args.publishAt <= now + 15_000) {
      raise(ERROR_CODES.INVALID, "Pick a time at least 15 seconds from now");
    }
    await ctx.db.patch(release._id, {
      state: "scheduled",
      publishAt: args.publishAt,
      publishedAt: undefined,
    });
    for (const track of members) {
      await ctx.db.patch(track._id, {
        state: "scheduled",
        publishAt: args.publishAt,
        publishedAt: undefined,
      });
    }
    await ctx.scheduler.runAt(
      args.publishAt,
      internal.studioReleases.publishScheduled,
      { releaseId: release._id }
    );
    return null;
  },
});

export const cancelSchedule = authedMutation({
  args: { releaseId: v.id("releases") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { release } = await requireOwnRelease(ctx, args.releaseId);
    if (release.state !== "scheduled") {
      return null;
    }
    await ctx.db.patch(release._id, {
      state: "draft",
      publishAt: undefined,
    });
    const members = await memberTracks(ctx, release._id);
    for (const track of members) {
      await ctx.db.patch(track._id, {
        state: "draft",
        publishAt: undefined,
      });
    }
    return null;
  },
});

export const publishScheduled = internalMutation({
  args: { releaseId: v.id("releases") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const release = await ctx.db.get(args.releaseId);
    if (release === null || release.state !== "scheduled") {
      return null;
    }
    const now = Date.now();
    if (release.publishAt !== undefined && release.publishAt > now) {
      return null;
    }
    return await publishRelease(ctx, release, now);
  },
});

export const publishDueScheduled = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("releases")
      .withIndex("by_state_publishAt", (q) => q.eq("state", "scheduled"))
      .collect();
    for (const release of due) {
      if (release.publishAt !== undefined && release.publishAt <= now) {
        await publishRelease(ctx, release, now);
      }
    }
    return null;
  },
});

export { GENRES };
