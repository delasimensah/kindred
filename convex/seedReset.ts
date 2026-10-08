import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { ERROR_CODES, raise } from "./lib/errors";
import { buildTrackPlan, seedUpdates } from "./lib/seedCatalog";

async function fileIdBySourceUrl(
  ctx: MutationCtx,
  sourceUrl: string
): Promise<Id<"files"> | null> {
  const file = await ctx.db
    .query("files")
    .withIndex("by_sourceUrl", (q) => q.eq("sourceUrl", sourceUrl))
    .unique();
  return file?._id ?? null;
}

/** Deletes an uploaded file and its blob. Seed files (with a source URL) stay. */
async function deleteUploadedFile(ctx: MutationCtx, fileId: Id<"files">) {
  const file = await ctx.db.get(fileId);
  if (file === null || file.sourceUrl !== undefined) {
    return false;
  }
  await ctx.db.delete(fileId);
  const shared = await ctx.db
    .query("files")
    .withIndex("by_storageId", (q) => q.eq("storageId", file.storageId))
    .first();
  if (shared === null) {
    await ctx.storage.delete(file.storageId);
  }
  return true;
}

async function deleteTrackAndLinks(ctx: MutationCtx, track: Doc<"tracks">) {
  const trackId = track._id;
  const entries = await ctx.db.query("playlistEntries").collect();
  for (const entry of entries) {
    if (entry.trackId === trackId) {
      await ctx.db.delete(entry._id);
    }
  }
  const items = await ctx.db.query("libraryItems").collect();
  for (const item of items) {
    if (item.trackId === trackId) {
      await ctx.db.delete(item._id);
    }
  }
  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_track_createdAt", (q) => q.eq("trackId", trackId))
    .collect();
  for (const reaction of reactions) {
    await ctx.db.delete(reaction._id);
  }
  const counts = await ctx.db
    .query("trackReactionCounts")
    .withIndex("by_trackId", (q) => q.eq("trackId", trackId))
    .collect();
  for (const row of counts) {
    await ctx.db.delete(row._id);
  }
  const listens = await ctx.db
    .query("listenEvents")
    .withIndex("by_track_startedAt", (q) => q.eq("trackId", trackId))
    .collect();
  for (const listen of listens) {
    await ctx.db.delete(listen._id);
  }
  const beats = await ctx.db
    .query("presenceHeartbeats")
    .withIndex("by_artist_lastBeatAt", (q) => q.eq("artistId", track.artistId))
    .collect();
  for (const beat of beats) {
    if (beat.trackId === trackId) {
      await ctx.db.delete(beat._id);
    }
  }
  const slots = await ctx.db.query("featuredSlots").collect();
  for (const slot of slots) {
    if (slot.trackId === trackId) {
      await ctx.db.delete(slot._id);
    }
  }
  const mixes = await ctx.db.query("mixes").collect();
  for (const mix of mixes) {
    if (mix.trackIds.includes(trackId)) {
      await ctx.db.patch(mix._id, {
        trackIds: mix.trackIds.filter((id) => id !== trackId),
      });
    }
  }
  await ctx.db.delete(trackId);
  await deleteUploadedFile(ctx, track.audioFileId);
  if (track.artworkFileId !== undefined) {
    const stillUsed = await ctx.db
      .query("tracks")
      .withIndex("by_artist_title", (q) => q.eq("artistId", track.artistId))
      .collect();
    if (!stillUsed.some((row) => row.artworkFileId === track.artworkFileId)) {
      await deleteUploadedFile(ctx, track.artworkFileId);
    }
  }
}

/**
 * Puts one seed artist back the way `yarn seed:catalog` made them, after
 * testing uploads in Studio. Uploaded tracks, releases, posts, and photos are
 * deleted. Seed tracks get their seed state, artwork, and visibility back.
 * Run `seedCatalog:attachSeedReleases` afterwards to rebuild the seed EP.
 */
export const resetArtist = internalMutation({
  args: {
    handle: v.string(),
    artworkSourceUrls: v.array(v.string()),
    avatarSourceUrl: v.string(),
    coverSourceUrl: v.string(),
  },
  returns: v.object({
    tracksRestored: v.number(),
    tracksDeleted: v.number(),
    releasesDeleted: v.number(),
    postsDeleted: v.number(),
  }),
  handler: async (ctx, args) => {
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (artist === null) {
      raise(ERROR_CODES.INVALID, `Unknown artist ${args.handle}`);
    }
    const avatarFileId = await fileIdBySourceUrl(ctx, args.avatarSourceUrl);
    const coverFileId = await fileIdBySourceUrl(ctx, args.coverSourceUrl);
    if (avatarFileId === null || coverFileId === null) {
      raise(ERROR_CODES.INVALID, "Seed avatar or cover is not registered");
    }
    await ctx.db.patch(artist._id, {
      avatarFileId,
      coverFileId,
      hidden: false,
      verified: true,
    });
    for (const kind of ["avatar", "cover"] as const) {
      const files = await ctx.db
        .query("files")
        .withIndex("by_artist_kind", (q) =>
          q.eq("artistId", artist._id).eq("kind", kind)
        )
        .collect();
      for (const file of files) {
        if (file._id !== avatarFileId && file._id !== coverFileId) {
          await deleteUploadedFile(ctx, file._id);
        }
      }
    }

    const releases = await ctx.db
      .query("releases")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", artist._id)
      )
      .collect();
    for (const release of releases) {
      await ctx.db.delete(release._id);
      const stillUsed = await ctx.db
        .query("tracks")
        .withIndex("by_artist_title", (q) => q.eq("artistId", artist._id))
        .collect();
      if (
        !stillUsed.some(
          (track) =>
            track.releaseId !== release._id &&
            track.artworkFileId === release.artworkFileId
        )
      ) {
        await deleteUploadedFile(ctx, release.artworkFileId);
      }
    }

    const plan = new Map(
      buildTrackPlan()
        .filter((track) => track.artistHandle === args.handle)
        .map((track) => [track.title, track])
    );
    const now = Date.now();
    let tracksRestored = 0;
    let tracksDeleted = 0;
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_artist_title", (q) => q.eq("artistId", artist._id))
      .collect();
    for (const track of tracks) {
      const seed = plan.get(track.title);
      if (seed === undefined) {
        await deleteTrackAndLinks(ctx, track);
        tracksDeleted += 1;
        continue;
      }
      const artworkSourceUrl = args.artworkSourceUrls[seed.artworkIndex];
      const artworkFileId =
        artworkSourceUrl === undefined
          ? null
          : await fileIdBySourceUrl(ctx, artworkSourceUrl);
      const dueScheduled =
        seed.state === "scheduled" &&
        seed.publishAt !== undefined &&
        seed.publishAt <= now;
      await ctx.db.patch(track._id, {
        visibility: seed.visibility,
        state: dueScheduled ? "published" : seed.state,
        publishAt: dueScheduled ? undefined : seed.publishAt,
        publishedAt: dueScheduled ? seed.publishAt : seed.publishedAt,
        tags: seed.tags,
        description: seed.description,
        genre: seed.genre,
        hidden: false,
        releaseId: undefined,
        position: undefined,
        ...(artworkFileId === null ? {} : { artworkFileId }),
      });
      tracksRestored += 1;
    }

    const seedBodies = new Set(
      seedUpdates()
        .filter((update) => update.artistHandle === args.handle)
        .map((update) => update.body)
    );
    let postsDeleted = 0;
    const posts = await ctx.db
      .query("updatePosts")
      .withIndex("by_artist_createdAt", (q) => q.eq("artistId", artist._id))
      .collect();
    for (const post of posts) {
      if (seedBodies.has(post.body)) {
        if (post.hidden) {
          await ctx.db.patch(post._id, { hidden: false });
        }
        continue;
      }
      await ctx.db.delete(post._id);
      if (post.photoFileId !== undefined) {
        await deleteUploadedFile(ctx, post.photoFileId);
      }
      if (post.voiceFileId !== undefined) {
        await deleteUploadedFile(ctx, post.voiceFileId);
      }
      postsDeleted += 1;
    }

    return {
      tracksRestored,
      tracksDeleted,
      releasesDeleted: releases.length,
      postsDeleted,
    };
  },
});

/** Sets every artist's stored follower count to the follows that exist. */
export const recountFollowers = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const stats = await ctx.db.query("artistStats").collect();
    for (const row of stats) {
      const follows = await ctx.db
        .query("follows")
        .withIndex("by_artist_createdAt", (q) => q.eq("artistId", row.artistId))
        .collect();
      await ctx.db.patch(row._id, {
        followerCount: follows.length,
        updatedAt: Date.now(),
      });
    }
    return stats.length;
  },
});

const PLAYLIST_TRACKS = 10;

/**
 * What: three listening playlists on one account, built from the seed catalog.
 * Where: public, published seed tracks. The names are ours.
 * Rights: the same Kevin MacLeod CC BY audio and Unsplash artwork as the catalog.
 * How: `npx convex run seedReset:replacePlaylists '{"email":"…"}'`. Replaces every
 * playlist that account already has.
 * Out: supporters-only tracks (they would sit locked in the list) and repeats of
 * the same recording inside one playlist.
 */
const DEMO_PLAYLISTS: { name: string; handles: string[] }[] = [
  {
    name: "Accra After Dark",
    handles: ["amaara", "kweku-darko", "nia-osei", "zainab-diallo"],
  },
  {
    name: "Lagos Heat",
    handles: ["sela-okoro", "leye-ade", "efe-okafor", "adjoa-boateng"],
  },
  {
    name: "Slow Sunday",
    handles: ["ibukun-balogun", "tewa-nkrumah", "yaw-asante", "chidi-nwosu"],
  },
];

/** Round-robin across artists, skipping a recording already in the list. */
function pickPlaylistTracks(
  byArtist: Doc<"tracks">[][],
  count: number
): Doc<"tracks">[] {
  const picked: Doc<"tracks">[] = [];
  const audio = new Set<string>();
  const cursors = byArtist.map(() => 0);
  let progressed = true;
  while (picked.length < count && progressed) {
    progressed = false;
    for (const [index, tracks] of byArtist.entries()) {
      if (picked.length === count) {
        break;
      }
      let cursor = cursors[index] ?? 0;
      while (cursor < tracks.length) {
        const track = tracks[cursor];
        cursor += 1;
        if (track !== undefined && !audio.has(track.audioFileId)) {
          audio.add(track.audioFileId);
          picked.push(track);
          progressed = true;
          break;
        }
      }
      cursors[index] = cursor;
    }
  }
  return picked;
}

export const replacePlaylists = internalMutation({
  args: { email: v.string() },
  returns: v.object({ deleted: v.number(), created: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    const profile =
      user === null
        ? null
        : await ctx.db
            .query("profiles")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", user._id))
            .unique();
    if (profile === null) {
      raise(ERROR_CODES.INVALID, `No profile for ${args.email}`);
    }
    const existing = await ctx.db
      .query("playlists")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .collect();
    for (const playlist of existing) {
      const entries = await ctx.db
        .query("playlistEntries")
        .withIndex("by_playlist_position", (q) =>
          q.eq("playlistId", playlist._id)
        )
        .collect();
      for (const entry of entries) {
        await ctx.db.delete(entry._id);
      }
      await ctx.db.delete(playlist._id);
    }

    const created: string[] = [];
    const now = Date.now();
    for (const [order, spec] of DEMO_PLAYLISTS.entries()) {
      const byArtist: Doc<"tracks">[][] = [];
      for (const handle of spec.handles) {
        const artist = await ctx.db
          .query("artists")
          .withIndex("by_handle", (q) => q.eq("handle", handle))
          .unique();
        if (artist === null || artist.hidden) {
          continue;
        }
        const tracks = await ctx.db
          .query("tracks")
          .withIndex("by_artist_state_publishedAt", (q) =>
            q.eq("artistId", artist._id).eq("state", "published")
          )
          .order("desc")
          .take(40);
        byArtist.push(
          tracks.filter(
            (track) =>
              track.visibility === "public" &&
              !track.hidden &&
              track.credit !== undefined
          )
        );
      }
      const picked = pickPlaylistTracks(byArtist, PLAYLIST_TRACKS);
      if (picked.length === 0) {
        continue;
      }
      const playlistId = await ctx.db.insert("playlists", {
        profileId: profile._id,
        name: spec.name,
        createdAt: now - order * 60_000,
      });
      for (const [position, track] of picked.entries()) {
        await ctx.db.insert("playlistEntries", {
          playlistId,
          trackId: track._id,
          position,
          addedAt: now,
        });
      }
      created.push(spec.name);
    }
    return { deleted: existing.length, created };
  },
});
