import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { requirePassword } from "./lib/accountPassword";
import {
  buildTrackPlan,
  SEED_ARTWORK_COUNT,
  SEED_AUDIO_COUNT,
  SEED_TRACK_CHUNK,
  seedAccounts,
  seedArtists,
  seedUpdates,
  type SeedAccount,
} from "./lib/seedCatalog";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import { ERROR_CODES, raise } from "./lib/errors";

const fileKind = v.union(
  v.literal("trackAudio"),
  v.literal("artwork"),
  v.literal("avatar"),
  v.literal("cover")
);

async function fileIdBySourceUrl(
  ctx: MutationCtx,
  sourceUrl: string
): Promise<Id<"files"> | null> {
  const existing = await ctx.db
    .query("files")
    .withIndex("by_sourceUrl", (q) => q.eq("sourceUrl", sourceUrl))
    .unique();
  return existing?._id ?? null;
}

export const upsertArtists = internalMutation({
  args: {},
  returns: v.object({ upserted: v.number() }),
  handler: async (ctx) => {
    let upserted = 0;
    const createdBase = Date.UTC(2026, 0, 1);
    for (const [index, artist] of seedArtists().entries()) {
      const existing = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", artist.handle))
        .unique();
      if (existing !== null) {
        await ctx.db.patch(existing._id, {
          name: artist.name,
          bio: artist.bio,
          verified: true,
          hidden: false,
        });
      } else {
        await ctx.db.insert("artists", {
          name: artist.name,
          handle: artist.handle,
          bio: artist.bio,
          verified: true,
          hidden: false,
          createdAt: createdBase + index * 60_000,
        });
      }
      upserted += 1;
    }
    return { upserted };
  },
});

/** Featured slots and rising scores so Discover is not empty on day one. */
export const upsertDiscovery = internalMutation({
  args: {},
  returns: v.object({
    stats: v.number(),
    featured: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const artists = seedArtists();
    let statsWritten = 0;
    for (const [index, artist] of artists.entries()) {
      const row = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", artist.handle))
        .unique();
      if (row === null) {
        continue;
      }
      const risingScore = artist.hero ? 900 - index * 10 : 400 - index * 15;
      const existingStats = await ctx.db
        .query("artistStats")
        .withIndex("by_artistId", (q) => q.eq("artistId", row._id))
        .unique();
      if (existingStats !== null) {
        await ctx.db.patch(existingStats._id, {
          risingScore,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("artistStats", {
          artistId: row._id,
          followerCount: 0,
          supporterCount: 0,
          followers7d: artist.hero ? 40 - index : 12 - index,
          distinctListeners7d: artist.hero ? 30 - index : 8 - index,
          plays7d: artist.hero ? 200 - index * 5 : 40 - index,
          risingScore,
          updatedAt: now,
        });
      }
      statsWritten += 1;
    }

    const featuredHandles = ["sela-okoro", "amaara"];
    let featuredWritten = 0;
    for (const [position, handle] of featuredHandles.entries()) {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", handle))
        .unique();
      if (artist === null) {
        continue;
      }
      const existingSlots = await ctx.db
        .query("featuredSlots")
        .withIndex("by_position", (q) => q.eq("position", position))
        .collect();
      const match = existingSlots.find(
        (slot) => slot.targetType === "artist" && slot.artistId === artist._id
      );
      if (match !== undefined) {
        await ctx.db.patch(match._id, {
          activeFrom: Date.UTC(2026, 0, 1),
          activeTo: undefined,
          note: "seed",
        });
      } else if (existingSlots.length === 0) {
        await ctx.db.insert("featuredSlots", {
          position,
          targetType: "artist",
          artistId: artist._id,
          activeFrom: Date.UTC(2026, 0, 1),
          note: "seed",
        });
      } else {
        await ctx.db.patch(existingSlots[0]._id, {
          targetType: "artist",
          artistId: artist._id,
          trackId: undefined,
          activeFrom: Date.UTC(2026, 0, 1),
          activeTo: undefined,
          note: "seed",
        });
      }
      featuredWritten += 1;
    }

    return { stats: statsWritten, featured: featuredWritten };
  },
});

export const storedAssets = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      sourceUrl: v.string(),
      storageId: v.id("_storage"),
    })
  ),
  handler: async (ctx) => {
    const files = await ctx.db.query("files").collect();
    return files.flatMap((file) =>
      file.sourceUrl === undefined
        ? []
        : [{ sourceUrl: file.sourceUrl, storageId: file.storageId }]
    );
  },
});

export const generateUploadUrls = internalMutation({
  args: { count: v.number() },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    if (args.count < 1 || args.count > 80) {
      raise(ERROR_CODES.INVALID, "Upload count must be between 1 and 80");
    }
    const urls: string[] = [];
    for (let index = 0; index < args.count; index += 1) {
      urls.push(await ctx.storage.generateUploadUrl());
    }
    return urls;
  },
});

const assetValidator = v.object({
  sourceUrl: v.string(),
  storageId: v.id("_storage"),
  contentType: v.string(),
  sizeBytes: v.number(),
  credit: v.string(),
  kind: fileKind,
  artistHandle: v.optional(v.string()),
});

export const registerFiles = internalMutation({
  args: { files: v.array(assetValidator) },
  returns: v.object({ registered: v.number(), reused: v.number() }),
  handler: async (ctx, args) => {
    let registered = 0;
    let reused = 0;
    for (const asset of args.files) {
      let fileId = await fileIdBySourceUrl(ctx, asset.sourceUrl);
      if (fileId === null) {
        fileId = await ctx.db.insert("files", {
          storageId: asset.storageId,
          kind: asset.kind,
          ...(asset.artistHandle === undefined
            ? {}
            : {
                artistId: await artistIdByHandle(ctx, asset.artistHandle),
              }),
          contentType: asset.contentType,
          sizeBytes: asset.sizeBytes,
          credit: asset.credit,
          sourceUrl: asset.sourceUrl,
          createdAt: Date.now(),
        });
        registered += 1;
      } else {
        await ctx.db.patch(fileId, { credit: asset.credit, kind: asset.kind });
        reused += 1;
      }
      if (
        asset.artistHandle !== undefined &&
        (asset.kind === "avatar" || asset.kind === "cover")
      ) {
        const artistId = await artistIdByHandle(ctx, asset.artistHandle);
        await ctx.db.patch(artistId, {
          ...(asset.kind === "avatar"
            ? { avatarFileId: fileId }
            : { coverFileId: fileId }),
        });
      }
    }
    return { registered, reused };
  },
});

const replacementValidator = v.object({
  previousSourceUrl: v.string(),
  sourceUrl: v.string(),
  storageId: v.id("_storage"),
  contentType: v.string(),
  sizeBytes: v.number(),
  credit: v.string(),
  kind: fileKind,
  artistHandle: v.optional(v.string()),
});

export const replaceSeedImages = internalMutation({
  args: { files: v.array(replacementValidator) },
  returns: v.object({ replaced: v.number(), missing: v.number() }),
  handler: async (ctx, args) => {
    let replaced = 0;
    let missing = 0;
    for (const asset of args.files) {
      const existing = await ctx.db
        .query("files")
        .withIndex("by_sourceUrl", (q) =>
          q.eq("sourceUrl", asset.previousSourceUrl)
        )
        .unique();
      if (existing === null) {
        const already = await ctx.db
          .query("files")
          .withIndex("by_sourceUrl", (q) => q.eq("sourceUrl", asset.sourceUrl))
          .unique();
        if (already === null) {
          missing += 1;
        } else {
          replaced += 1;
        }
        continue;
      }
      await ctx.db.patch(existing._id, {
        storageId: asset.storageId,
        contentType: asset.contentType,
        sizeBytes: asset.sizeBytes,
        credit: asset.credit,
        sourceUrl: asset.sourceUrl,
        kind: asset.kind,
      });
      replaced += 1;
      if (
        asset.artistHandle !== undefined &&
        (asset.kind === "avatar" || asset.kind === "cover")
      ) {
        const artistId = await artistIdByHandle(ctx, asset.artistHandle);
        await ctx.db.patch(artistId, {
          ...(asset.kind === "avatar"
            ? { avatarFileId: existing._id }
            : { coverFileId: existing._id }),
        });
      }
    }
    return { replaced, missing };
  },
});

async function artistIdByHandle(
  ctx: MutationCtx,
  handle: string
): Promise<Id<"artists">> {
  const artist = await ctx.db
    .query("artists")
    .withIndex("by_handle", (q) => q.eq("handle", handle))
    .unique();
  if (artist === null) {
    raise(ERROR_CODES.INVALID, `Unknown artist ${handle}`);
  }
  return artist._id;
}

export const insertTrackChunk = internalMutation({
  args: {
    start: v.number(),
    audioSourceUrls: v.array(v.string()),
    artworkSourceUrls: v.array(v.string()),
    peaks: v.array(v.array(v.number())),
    durationMs: v.array(v.number()),
  },
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx, args) => {
    if (args.audioSourceUrls.length !== SEED_AUDIO_COUNT) {
      raise(ERROR_CODES.INVALID, "Seed audio list must contain 40 files");
    }
    if (args.artworkSourceUrls.length !== SEED_ARTWORK_COUNT) {
      raise(ERROR_CODES.INVALID, "Seed artwork list must contain 36 files");
    }
    const slice = buildTrackPlan().slice(
      args.start,
      args.start + SEED_TRACK_CHUNK
    );
    if (
      args.peaks.length !== slice.length ||
      args.durationMs.length !== slice.length
    ) {
      raise(ERROR_CODES.INVALID, "Peaks must match the track chunk");
    }
    let inserted = 0;
    let skipped = 0;
    for (const [index, track] of slice.entries()) {
      const artistId = await artistIdByHandle(ctx, track.artistHandle);
      const existing = await ctx.db
        .query("tracks")
        .withIndex("by_artist_title", (q) =>
          q.eq("artistId", artistId).eq("title", track.title)
        )
        .unique();
      if (existing !== null) {
        skipped += 1;
        continue;
      }
      const peakRow = args.peaks[index];
      if (peakRow === undefined || peakRow.length !== TRACK_PEAK_BUCKETS) {
        raise(ERROR_CODES.INVALID, "Each track needs 1000 peak buckets");
      }
      if (peakRow.some((peak) => peak < 0 || peak > 1)) {
        raise(ERROR_CODES.INVALID, "Peaks must be between 0 and 1");
      }
      const durationMs = args.durationMs[index];
      if (durationMs === undefined || durationMs <= 0) {
        raise(ERROR_CODES.INVALID, "Track duration is missing");
      }
      const audioSourceUrl = args.audioSourceUrls[track.audioIndex];
      const artworkSourceUrl = args.artworkSourceUrls[track.artworkIndex];
      if (audioSourceUrl === undefined || artworkSourceUrl === undefined) {
        raise(ERROR_CODES.INVALID, "Seed file index is out of range");
      }
      const audioFileId = await fileIdBySourceUrl(ctx, audioSourceUrl);
      const artworkFileId = await fileIdBySourceUrl(ctx, artworkSourceUrl);
      if (audioFileId === null || artworkFileId === null) {
        raise(ERROR_CODES.INVALID, "Seed file is not registered");
      }
      const audioFile = await ctx.db.get(audioFileId);
      await ctx.db.insert("tracks", {
        artistId,
        title: track.title,
        audioFileId,
        artworkFileId,
        visibility: track.visibility,
        state: track.state,
        ...(track.publishedAt === undefined
          ? {}
          : { publishedAt: track.publishedAt }),
        ...(track.publishAt === undefined
          ? {}
          : { publishAt: track.publishAt }),
        durationMs,
        peaks: peakRow,
        tags: track.tags,
        ...(track.description === undefined
          ? {}
          : { description: track.description }),
        genre: track.genre,
        hidden: false,
        ...(audioFile?.credit === undefined
          ? {}
          : { credit: audioFile.credit }),
        createdAt:
          track.publishedAt ?? track.publishAt ?? Date.UTC(2026, 0, 15),
      });
      inserted += 1;
    }
    return { inserted, skipped };
  },
});

const DAY_MS = 86_400_000;

export const insertArtistUpdates = internalMutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    let inserted = 0;
    let skipped = 0;
    const now = Date.now();
    for (const update of seedUpdates()) {
      const artistId = await artistIdByHandle(ctx, update.artistHandle);
      const existing = await ctx.db
        .query("updatePosts")
        .withIndex("by_artist_createdAt", (q) => q.eq("artistId", artistId))
        .collect();
      if (existing.some((post) => post.body === update.body)) {
        skipped += 1;
        continue;
      }
      await ctx.db.insert("updatePosts", {
        artistId,
        body: update.body,
        audience: update.audience,
        hidden: false,
        createdAt: now - update.ageDays * DAY_MS,
      });
      inserted += 1;
    }
    return { inserted, skipped };
  },
});

export const userIdByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    return user?._id ?? null;
  },
});

const FAN_PLAYLIST_NAME = "Sunday in Osu";

async function ensureFollow(
  ctx: MutationCtx,
  profileId: Id<"profiles">,
  artistId: Id<"artists">
) {
  const existing = await ctx.db
    .query("follows")
    .withIndex("by_profile_artist", (q) =>
      q.eq("profileId", profileId).eq("artistId", artistId)
    )
    .unique();
  if (existing !== null) {
    return;
  }
  await ctx.db.insert("follows", {
    profileId,
    artistId,
    createdAt: Date.now(),
  });
}

async function ensureLike(
  ctx: MutationCtx,
  profileId: Id<"profiles">,
  trackId: Id<"tracks">
) {
  const existing = await ctx.db
    .query("libraryItems")
    .withIndex("by_profile_track", (q) =>
      q.eq("profileId", profileId).eq("trackId", trackId)
    )
    .collect();
  if (existing.some((item) => item.kind === "liked")) {
    return;
  }
  await ctx.db.insert("libraryItems", {
    profileId,
    trackId,
    kind: "liked",
    createdAt: Date.now(),
  });
}

async function trackByTitle(
  ctx: MutationCtx,
  handle: string,
  title: string
): Promise<Id<"tracks"> | null> {
  const artistId = await artistIdByHandle(ctx, handle);
  const track = await ctx.db
    .query("tracks")
    .withIndex("by_artist_title", (q) =>
      q.eq("artistId", artistId).eq("title", title)
    )
    .unique();
  return track?._id ?? null;
}

async function ensureFanPlaylist(ctx: MutationCtx, profileId: Id<"profiles">) {
  const existing = await ctx.db
    .query("playlists")
    .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profileId))
    .collect();
  if (existing.some((playlist) => playlist.name === FAN_PLAYLIST_NAME)) {
    return;
  }
  const artistId = await artistIdByHandle(ctx, "amaara");
  const tracks = await ctx.db
    .query("tracks")
    .withIndex("by_artist_state_publishedAt", (q) =>
      q.eq("artistId", artistId).eq("state", "published")
    )
    .collect();
  const playable = tracks.filter(
    (track) => track.visibility === "public" && !track.hidden
  );
  if (playable.length === 0) {
    return;
  }
  const playlistId = await ctx.db.insert("playlists", {
    profileId,
    name: FAN_PLAYLIST_NAME,
    createdAt: Date.now(),
  });
  const chosen = playable.slice(0, 3);
  for (const [position, track] of chosen.entries()) {
    await ctx.db.insert("playlistEntries", {
      playlistId,
      trackId: track._id,
      position,
      addedAt: Date.now(),
    });
  }
}

async function upsertProfile(
  ctx: MutationCtx,
  account: SeedAccount,
  authUserId: Id<"users">
): Promise<Id<"profiles">> {
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", authUserId))
    .unique();
  if (existing !== null) {
    await ctx.db.patch(existing._id, {
      displayName: account.displayName,
      genres: account.genres,
      isAdmin: account.isAdmin,
      timezone: account.timezone,
      ...(existing.onboardingCompletedAt === undefined
        ? { onboardingCompletedAt: Date.now() }
        : {}),
    });
    return existing._id;
  }
  return await ctx.db.insert("profiles", {
    authUserId,
    displayName: account.displayName,
    genres: account.genres,
    isAdmin: account.isAdmin,
    timezone: account.timezone,
    onboardingCompletedAt: Date.now(),
    createdAt: Date.now(),
  });
}

export const attachProfiles = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    let attached = 0;
    for (const account of seedAccounts()) {
      const authUserId = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", account.email))
        .unique();
      if (authUserId === null) {
        continue;
      }
      const profileId = await upsertProfile(ctx, account, authUserId._id);
      attached += 1;
      if (account.artistHandle !== undefined) {
        const artistId = await artistIdByHandle(ctx, account.artistHandle);
        await ctx.db.patch(artistId, { profileId });
      }
      for (const handle of account.follows) {
        await ensureFollow(ctx, profileId, await artistIdByHandle(ctx, handle));
      }
      if (account.role === "supporter") {
        const asaseId = await trackByTitle(ctx, "amaara", "Asase");
        if (asaseId !== null) {
          await ensureLike(ctx, profileId, asaseId);
        }
      }
      if (account.role === "fan") {
        const artistId = await artistIdByHandle(ctx, "kweku-darko");
        const tracks = await ctx.db
          .query("tracks")
          .withIndex("by_artist_state_publishedAt", (q) =>
            q.eq("artistId", artistId).eq("state", "published")
          )
          .collect();
        const first = tracks.find(
          (track) => track.visibility === "public" && !track.hidden
        );
        if (first !== undefined) {
          await ensureLike(ctx, profileId, first._id);
        }
        await ensureFanPlaylist(ctx, profileId);
      }
    }
    return attached;
  },
});

/**
 * Efua Boateng is the supporter login. This does not write a paid
 * entitlement. That table is not in the database yet.
 */
export const ensureAccounts = internalAction({
  args: { password: v.string() },
  returns: v.object({
    created: v.number(),
    existing: v.number(),
    profiles: v.number(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{ created: number; existing: number; profiles: number }> => {
    requirePassword(args.password);
    let created = 0;
    let existing = 0;
    for (const account of seedAccounts()) {
      const userId: Id<"users"> | null = await ctx.runQuery(
        internal.seedCatalog.userIdByEmail,
        { email: account.email }
      );
      if (userId !== null) {
        existing += 1;
        continue;
      }
      await createAccount(ctx, {
        provider: "password",
        account: { id: account.email, secret: args.password },
        profile: { email: account.email, name: account.displayName },
      });
      created += 1;
    }
    const profiles: number = await ctx.runMutation(
      internal.seedCatalog.attachProfiles,
      {}
    );
    return { created, existing, profiles };
  },
});
