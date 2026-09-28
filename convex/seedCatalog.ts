import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { isFoundingSupporter } from "shared";

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
import { SEED_VOICE_NOTE } from "./lib/seedVoice";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import { ERROR_CODES, raise } from "./lib/errors";

const fileKind = v.union(
  v.literal("trackAudio"),
  v.literal("artwork"),
  v.literal("avatar"),
  v.literal("cover"),
  v.literal("updatePhoto"),
  v.literal("voiceNote")
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

/**
 * Swap the forty seed MP3 blobs for shorter encodes and patch every track that
 * points at them (duration + peaks). Deletes the previous storage objects.
 */
export const replaceSeedAudio = internalMutation({
  args: {
    files: v.array(
      v.object({
        sourceUrl: v.string(),
        storageId: v.id("_storage"),
        sizeBytes: v.number(),
        credit: v.string(),
        durationMs: v.number(),
        peaks: v.array(v.number()),
      })
    ),
  },
  returns: v.object({
    filesReplaced: v.number(),
    tracksPatched: v.number(),
    missing: v.number(),
  }),
  handler: async (ctx, args) => {
    if (args.files.length === 0 || args.files.length > SEED_AUDIO_COUNT) {
      raise(ERROR_CODES.INVALID, "Replace at most 40 seed audio files");
    }
    let filesReplaced = 0;
    let tracksPatched = 0;
    let missing = 0;
    const tracks = await ctx.db.query("tracks").collect();
    for (const asset of args.files) {
      if (asset.peaks.length !== TRACK_PEAK_BUCKETS) {
        raise(ERROR_CODES.INVALID, "Each audio file needs 1000 peak buckets");
      }
      if (asset.durationMs <= 0) {
        raise(ERROR_CODES.INVALID, "Duration must be positive");
      }
      if (asset.peaks.some((peak) => peak < 0 || peak > 1)) {
        raise(ERROR_CODES.INVALID, "Peaks must be between 0 and 1");
      }
      const existing = await ctx.db
        .query("files")
        .withIndex("by_sourceUrl", (q) => q.eq("sourceUrl", asset.sourceUrl))
        .unique();
      if (existing === null) {
        missing += 1;
        continue;
      }
      const previousStorageId = existing.storageId;
      await ctx.db.patch(existing._id, {
        storageId: asset.storageId,
        sizeBytes: asset.sizeBytes,
        credit: asset.credit,
        contentType: "audio/mpeg",
        kind: "trackAudio",
      });
      if (previousStorageId !== asset.storageId) {
        await ctx.storage.delete(previousStorageId);
      }
      filesReplaced += 1;
      for (const track of tracks) {
        if (track.audioFileId !== existing._id) {
          continue;
        }
        await ctx.db.patch(track._id, {
          durationMs: asset.durationMs,
          peaks: asset.peaks,
          ...(asset.credit.length === 0 ? {} : { credit: asset.credit }),
        });
        tracksPatched += 1;
      }
    }
    return { filesReplaced, tracksPatched, missing };
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

async function newestArtwork(ctx: MutationCtx, artistId: Id<"artists">) {
  const track = await ctx.db
    .query("tracks")
    .withIndex("by_artist_state_publishedAt", (q) =>
      q.eq("artistId", artistId).eq("state", "published")
    )
    .order("desc")
    .first();
  if (track?.artworkFileId === undefined) {
    return null;
  }
  return await ctx.db.get(track.artworkFileId);
}

async function attachSeedPhoto(
  ctx: MutationCtx,
  artistId: Id<"artists">,
  postId: Id<"updatePosts">
) {
  const post = await ctx.db.get(postId);
  if (post === null || post.photoFileId !== undefined) {
    return;
  }
  const sourceUrl = `seed://update-photo/${artistId}`;
  let fileId = await fileIdBySourceUrl(ctx, sourceUrl);
  if (fileId === null) {
    const artwork = await newestArtwork(ctx, artistId);
    if (artwork === null) {
      return;
    }
    fileId = await ctx.db.insert("files", {
      storageId: artwork.storageId,
      kind: "updatePhoto",
      artistId,
      contentType: artwork.contentType,
      sizeBytes: artwork.sizeBytes,
      ...(artwork.credit === undefined ? {} : { credit: artwork.credit }),
      sourceUrl,
      createdAt: Date.now(),
    });
  }
  await ctx.db.patch(postId, { photoFileId: fileId });
}

async function attachSeedVoice(
  ctx: MutationCtx,
  artistId: Id<"artists">,
  postId: Id<"updatePosts">
) {
  const fileId = await fileIdBySourceUrl(ctx, SEED_VOICE_NOTE.sourceUrl);
  const post = await ctx.db.get(postId);
  if (post === null) {
    return;
  }
  if (fileId === null) {
    if (post.voiceFileId !== undefined) {
      const current = await ctx.db.get(post.voiceFileId);
      if (current?.sourceUrl !== SEED_VOICE_NOTE.sourceUrl) {
        await ctx.db.patch(postId, { voiceFileId: undefined });
      }
    }
    await ctx.db.patch(postId, {
      voiceDurationMs: SEED_VOICE_NOTE.durationMs,
      voicePeaks: SEED_VOICE_NOTE.peaks,
    });
    return;
  }
  const voice = await ctx.db.get(fileId);
  if (voice !== null && voice.artistId === undefined) {
    await ctx.db.patch(fileId, { artistId });
  }
  await ctx.db.patch(postId, {
    voiceFileId: fileId,
    voiceDurationMs: SEED_VOICE_NOTE.durationMs,
    voicePeaks: SEED_VOICE_NOTE.peaks,
  });
}

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
      const match = existing.find((post) => post.body === update.body);
      if (match !== undefined) {
        if (update.photo === true) {
          await attachSeedPhoto(ctx, artistId, match._id);
        }
        if (update.voice === true) {
          await attachSeedVoice(ctx, artistId, match._id);
        }
        skipped += 1;
        continue;
      }
      const postId = await ctx.db.insert("updatePosts", {
        artistId,
        body: update.body,
        audience: update.audience,
        hidden: false,
        createdAt: now - update.ageDays * DAY_MS,
        ...(update.voiceDurationMs === undefined
          ? {}
          : {
              voiceDurationMs: update.voiceDurationMs,
              voicePeaks: SEED_VOICE_NOTE.peaks,
            }),
      });
      if (update.photo === true) {
        await attachSeedPhoto(ctx, artistId, postId);
      }
      if (update.voice === true) {
        await attachSeedVoice(ctx, artistId, postId);
      }
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
 * Efua Boateng is the supporter login. Support economy seed
 * (seedSupportEconomy) writes her entitlement and routes.
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

/**
 * Groups existing published seed tracks into one EP (Amaara) and one album
 * (Kweku) so mobile can show Albums without new audio files.
 */
export const attachSeedReleases = internalMutation({
  args: {},
  returns: v.object({ ep: v.boolean(), album: v.boolean() }),
  handler: async (ctx) => {
    let ep = false;
    let album = false;

    const amaara = await ctx.db
      .query("artists")
      .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
      .unique();
    if (amaara !== null) {
      const existing = await ctx.db
        .query("releases")
        .withIndex("by_artist_state_publishedAt", (q) =>
          q.eq("artistId", amaara._id).eq("state", "published")
        )
        .first();
      if (existing === null) {
        const published = await ctx.db
          .query("tracks")
          .withIndex("by_artist_state_publishedAt", (q) =>
            q.eq("artistId", amaara._id).eq("state", "published")
          )
          .order("desc")
          .collect();
        const candidates = published.filter(
          (track) =>
            !track.hidden &&
            track.releaseId === undefined &&
            track.title !== "Asase"
        );
        const members = candidates.slice(0, 4);
        if (members.length === 4) {
          const artworkFileId =
            members[0]?.artworkFileId ?? amaara.avatarFileId;
          if (artworkFileId !== undefined) {
            const releaseId = await ctx.db.insert("releases", {
              artistId: amaara._id,
              title: "Lagoon Sessions",
              type: "ep",
              artworkFileId,
              visibility: "public",
              state: "published",
              publishedAt: members[0]?.publishedAt ?? Date.now(),
              genre: "Afro-soul and R&B",
              tags: ["ep", "seed"],
              description: "Four tracks from Amaara's Accra sessions.",
              hidden: false,
              createdAt: Date.now(),
            });
            for (let index = 0; index < members.length; index += 1) {
              const track = members[index];
              if (track === undefined) {
                continue;
              }
              await ctx.db.patch(track._id, {
                releaseId,
                position: index,
                artworkFileId,
              });
            }
            ep = true;
          }
        }
      } else {
        ep = true;
      }
    }

    const kweku = await ctx.db
      .query("artists")
      .withIndex("by_handle", (q) => q.eq("handle", "kweku-darko"))
      .unique();
    if (kweku !== null) {
      const existing = await ctx.db
        .query("releases")
        .withIndex("by_artist_state_publishedAt", (q) =>
          q.eq("artistId", kweku._id).eq("state", "published")
        )
        .first();
      if (existing === null) {
        const published = await ctx.db
          .query("tracks")
          .withIndex("by_artist_state_publishedAt", (q) =>
            q.eq("artistId", kweku._id).eq("state", "published")
          )
          .order("desc")
          .collect();
        const candidates = published.filter(
          (track) => !track.hidden && track.releaseId === undefined
        );
        const members = candidates.slice(0, 7);
        if (members.length === 7) {
          const artworkFileId = members[0]?.artworkFileId ?? kweku.avatarFileId;
          if (artworkFileId !== undefined) {
            const releaseId = await ctx.db.insert("releases", {
              artistId: kweku._id,
              title: "Kumasi Nights",
              type: "album",
              artworkFileId,
              visibility: "public",
              state: "published",
              publishedAt: members[0]?.publishedAt ?? Date.now(),
              genre: "Highlife",
              tags: ["album", "seed"],
              description: "Seven tracks from Kweku's Kumasi set.",
              hidden: false,
              createdAt: Date.now(),
            });
            for (let index = 0; index < members.length; index += 1) {
              const track = members[index];
              if (track === undefined) {
                continue;
              }
              await ctx.db.patch(track._id, {
                releaseId,
                position: index,
                artworkFileId,
              });
            }
            album = true;
          }
        }
      } else {
        album = true;
      }
    }

    return { ep, album };
  },
});

async function ensureEntitlement(
  ctx: MutationCtx,
  profileId: Id<"profiles">,
  priceTier: "4.99" | "9.99"
) {
  const existing = await ctx.db
    .query("entitlements")
    .withIndex("by_profileId", (q) => q.eq("profileId", profileId))
    .unique();
  const now = Date.now();
  const patch = {
    status: "active" as const,
    productId: `kindred_supporter_${priceTier}`,
    priceTier,
    store: "app_store" as const,
    rcAppUserId: String(profileId),
    currentPeriodEnd: now + 30 * DAY_MS,
    willRenew: true,
    lastVerifiedAt: now,
    updatedAt: now,
  };
  if (existing !== null) {
    await ctx.db.patch(existing._id, patch);
    return;
  }
  await ctx.db.insert("entitlements", {
    profileId,
    ...patch,
  });
}

async function ensureRoute(
  ctx: MutationCtx,
  args: {
    profileId: Id<"profiles">;
    artistId: Id<"artists">;
    startedAt: number;
    founding: boolean;
  }
) {
  const existing = await ctx.db
    .query("supportRoutes")
    .withIndex("by_profile_artist", (q) =>
      q.eq("profileId", args.profileId).eq("artistId", args.artistId)
    )
    .unique();
  if (existing !== null) {
    await ctx.db.patch(existing._id, {
      active: true,
      endedAt: undefined,
      startedAt: args.startedAt,
      founding: args.founding,
      ...(existing.thanked === undefined ? { thanked: false } : {}),
    });
    return;
  }
  await ctx.db.insert("supportRoutes", {
    profileId: args.profileId,
    artistId: args.artistId,
    active: true,
    startedAt: args.startedAt,
    founding: args.founding,
    thanked: false,
  });
}

async function ensureListen(
  ctx: MutationCtx,
  args: {
    profileId: Id<"profiles">;
    artistId: Id<"artists">;
    trackId: Id<"tracks">;
    msPlayed: number;
    clientEventId: string;
  }
) {
  const existing = await ctx.db
    .query("listenEvents")
    .withIndex("by_profile_clientEventId", (q) =>
      q.eq("profileId", args.profileId).eq("clientEventId", args.clientEventId)
    )
    .unique();
  if (existing !== null) {
    return;
  }
  await ctx.db.insert("listenEvents", {
    profileId: args.profileId,
    trackId: args.trackId,
    artistId: args.artistId,
    startedAt: Date.now() - DAY_MS,
    msPlayed: args.msPlayed,
    completed: true,
    source: "artist",
    clientEventId: args.clientEventId,
  });
}

/**
 * What: active entitlements, support routes, listen minutes, and demo earnings.
 * Where: seed-only fictional accounts (Efua + audience logins).
 * Rights: original fiction.
 * How: run after ensureAccounts; then earnings.seedPastMonths.
 * Out: real RevenueCat purchases; rewriting past months after routes change.
 */
export const seedSupportEconomy = internalMutation({
  args: {},
  returns: v.object({
    entitlements: v.number(),
    routes: v.number(),
    listens: v.number(),
  }),
  handler: async (ctx) => {
    const amaara = await artistIdByHandle(ctx, "amaara");
    const kweku = await artistIdByHandle(ctx, "kweku-darko");
    const sela = await artistIdByHandle(ctx, "sela-okoro");
    const asaseId = await trackByTitle(ctx, "amaara", "Asase");

    let entitlements = 0;
    let routes = 0;
    let listens = 0;
    const now = Date.now();
    const joinedBefore = new Map<Id<"artists">, number>();
    const foundingFor = (artistId: Id<"artists">) => {
      const before = joinedBefore.get(artistId) ?? 0;
      joinedBefore.set(artistId, before + 1);
      return isFoundingSupporter(before);
    };

    const profiles: { profileId: Id<"profiles">; email: string }[] = [];
    for (const account of seedAccounts()) {
      if (
        account.role !== "supporter" &&
        account.role !== "audience" &&
        account.role !== "fan"
      ) {
        continue;
      }
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", account.email))
        .unique();
      if (user === null) {
        continue;
      }
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
        .unique();
      if (profile === null) {
        continue;
      }
      profiles.push({ profileId: profile._id, email: account.email });
    }

    // Efua + audience profiles become active supporters (skip free fan Akosua).
    const efua = profiles.filter(
      (row) => row.email === "efua.boateng@kindred.example"
    );
    const others = profiles.filter(
      (row) =>
        row.email !== "efua.boateng@kindred.example" &&
        row.email !== "akosua.frimpong@kindred.example"
    );
    const supporters = [...efua, ...others].slice(0, 25);

    for (const [index, row] of supporters.entries()) {
      const isEfua = row.email === "efua.boateng@kindred.example";
      const priceTier = index % 5 === 0 ? "9.99" : "4.99";
      await ensureEntitlement(ctx, row.profileId, priceTier);
      entitlements += 1;

      // Index 0 is the earliest route. Later indexes start later.
      const daysAgo = 30 + (supporters.length - 1 - index) * 7;
      const startedAt = now - daysAgo * DAY_MS;

      await ensureRoute(ctx, {
        profileId: row.profileId,
        artistId: amaara,
        startedAt,
        founding: foundingFor(amaara),
      });
      routes += 1;

      if (isEfua || index % 3 === 0) {
        await ensureRoute(ctx, {
          profileId: row.profileId,
          artistId: kweku,
          startedAt: startedAt + DAY_MS,
          founding: foundingFor(kweku),
        });
        routes += 1;
      }
      if (isEfua || index % 4 === 0) {
        await ensureRoute(ctx, {
          profileId: row.profileId,
          artistId: sela,
          startedAt: startedAt + 2 * DAY_MS,
          founding: foundingFor(sela),
        });
        routes += 1;
      }

      if (asaseId !== null) {
        await ensureListen(ctx, {
          profileId: row.profileId,
          artistId: amaara,
          trackId: asaseId,
          msPlayed: 60_000 + index * 45_000,
          clientEventId: `seed-listen-${row.profileId}-asase`,
        });
        listens += 1;
      }
    }

    for (const artistId of [amaara, kweku, sela]) {
      let supporterCount = 0;
      let cursor: string | null = null;
      let done = false;
      while (!done) {
        const page = await ctx.db
          .query("supportRoutes")
          .withIndex("by_artist_active", (q) =>
            q.eq("artistId", artistId).eq("active", true)
          )
          .paginate({ numItems: 50, cursor });
        supporterCount += page.page.length;
        done = page.isDone;
        cursor = page.continueCursor;
      }
      const stats = await ctx.db
        .query("artistStats")
        .withIndex("by_artistId", (q) => q.eq("artistId", artistId))
        .unique();
      if (stats !== null) {
        await ctx.db.patch(stats._id, {
          supporterCount,
          updatedAt: Date.now(),
        });
      }
    }

    return { entitlements, routes, listens };
  },
});

const PUBLIC_MIX_SLUG = "late-night";

/**
 * What: one shareable mix of catalog tracks, including one exclusive so the public page can show a lock.
 * Where: tracks already in the seed catalog. The name and why line are ours.
 * Rights: same CC0 / CC-BY seed audio. The words are original.
 * How: `npx convex run seedCatalog:ensurePublicMix` after accounts exist. `yarn seed:catalog` calls it too.
 * Out: making a mix from a sentence. That is KIND-72.
 */
export const ensurePublicMix = internalMutation({
  args: {},
  returns: v.object({
    created: v.boolean(),
    slug: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("mixes")
      .withIndex("by_slug", (q) => q.eq("slug", PUBLIC_MIX_SLUG))
      .unique();
    if (existing !== null) {
      return { created: false, slug: existing.slug };
    }
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) =>
        q.eq("email", "akosua.frimpong@kindred.example")
      )
      .unique();
    if (user === null) {
      return { created: false, slug: null };
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
      .unique();
    if (profile === null) {
      return { created: false, slug: null };
    }
    const amaara = await ctx.db
      .query("artists")
      .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
      .unique();
    if (amaara === null) {
      return { created: false, slug: null };
    }
    const amaaraId = amaara._id;
    const published = await ctx.db
      .query("tracks")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", amaaraId).eq("state", "published")
      )
      .order("desc")
      .take(40);
    const visible = published.filter((track) => !track.hidden);
    const playable = visible
      .filter((track) => track.visibility === "public")
      .slice(0, 6);
    const exclusive = visible.find(
      (track) => track.visibility === "supporters"
    );
    if (playable.length === 0) {
      return { created: false, slug: null };
    }
    const trackIds = exclusive
      ? [...playable.slice(0, 2), exclusive, ...playable.slice(2)]
      : playable;
    await ctx.db.insert("mixes", {
      profileId: profile._id,
      prompt: "late night highlife",
      name: "Late Night Highlife",
      why: "A slow wind-down from songs already in the catalog.",
      trackIds: trackIds.map((track) => track._id),
      slug: PUBLIC_MIX_SLUG,
      createdAt: Date.now(),
    });
    return { created: true, slug: PUBLIC_MIX_SLUG };
  },
});
