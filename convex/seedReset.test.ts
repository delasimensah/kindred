import { describe, expect, it } from "vitest";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import {
  SEED_ARTWORK_COUNT,
  SEED_AUDIO_COUNT,
  SEED_TRACK_CHUNK,
} from "./lib/seedCatalog";
import { makeBackend } from "./test.setup";

const AVATAR_URL = "https://unsplash.com/photos/amaara-avatar";
const COVER_URL = "https://unsplash.com/photos/amaara-cover";

async function seedAmaara() {
  const t = makeBackend();
  await t.mutation(internal.seedCatalog.upsertArtists, {});
  const storageId = await t.run(async (ctx) =>
    ctx.storage.store(new Blob(["seed"], { type: "image/jpeg" }))
  );
  const audio = Array.from({ length: SEED_AUDIO_COUNT }, (_, index) => ({
    sourceUrl: `https://incompetech.com/seed-${index}.mp3`,
    storageId,
    contentType: "audio/mpeg",
    sizeBytes: 5,
    credit: "Seed audio by Kevin MacLeod — CC BY 4.0",
    kind: "trackAudio" as const,
  }));
  const artwork = Array.from({ length: SEED_ARTWORK_COUNT }, (_, index) => ({
    sourceUrl: `https://unsplash.com/photos/artwork-${index}`,
    storageId,
    contentType: "image/jpeg",
    sizeBytes: 4,
    credit: "Photo: Seed / Unsplash",
    kind: "artwork" as const,
  }));
  const portraits = [
    { sourceUrl: AVATAR_URL, kind: "avatar" as const },
    { sourceUrl: COVER_URL, kind: "cover" as const },
  ].map((file) => ({
    ...file,
    storageId,
    contentType: "image/jpeg",
    sizeBytes: 4,
    credit: "Photo: Seed / Unsplash",
    artistHandle: "amaara",
  }));
  await t.mutation(internal.seedCatalog.registerFiles, {
    files: [...audio, ...artwork, ...portraits],
  });
  await t.mutation(internal.seedCatalog.insertTrackChunk, {
    start: 0,
    audioSourceUrls: audio.map((file) => file.sourceUrl),
    artworkSourceUrls: artwork.map((file) => file.sourceUrl),
    peaks: Array.from({ length: SEED_TRACK_CHUNK }, () =>
      Array.from({ length: TRACK_PEAK_BUCKETS }, () => 0.25)
    ),
    durationMs: Array.from({ length: SEED_TRACK_CHUNK }, () => 75_000),
  });
  return { t, artworkSourceUrls: artwork.map((file) => file.sourceUrl) };
}

describe("seedReset", () => {
  it("removes Studio test uploads and restores the seed artist", async () => {
    const { t, artworkSourceUrls } = await seedAmaara();
    const ids = await t.run(async (ctx) => {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
        .unique();
      if (artist === null) {
        throw new Error("Amaara missing");
      }
      const blob = await ctx.storage.store(new Blob(["upload"]));
      const upload = (kind: "avatar" | "artwork" | "trackAudio") =>
        ctx.db.insert("files", {
          storageId: blob,
          kind,
          artistId: artist._id,
          contentType: "image/jpeg",
          sizeBytes: 6,
          createdAt: 1,
        });
      const testAvatar = await upload("avatar");
      await ctx.db.patch(artist._id, { avatarFileId: testAvatar });
      const releaseArt = await upload("artwork");
      const releaseId = await ctx.db.insert("releases", {
        artistId: artist._id,
        title: "test",
        type: "ep",
        artworkFileId: releaseArt,
        visibility: "public",
        state: "published",
        publishedAt: 1,
        genre: "Afro-soul and R&B",
        tags: [],
        hidden: false,
        createdAt: 1,
      });
      const storm = await ctx.db.insert("tracks", {
        artistId: artist._id,
        title: "storm",
        audioFileId: await upload("trackAudio"),
        artworkFileId: releaseArt,
        visibility: "public",
        state: "published",
        publishedAt: 1,
        durationMs: 1,
        peaks: [],
        tags: [],
        genre: "Afro-soul and R&B",
        hidden: false,
        releaseId,
        position: 0,
        createdAt: 1,
      });
      const asase = await ctx.db
        .query("tracks")
        .withIndex("by_artist_title", (q) =>
          q.eq("artistId", artist._id).eq("title", "Asase")
        )
        .unique();
      if (asase === null) {
        throw new Error("Asase missing");
      }
      await ctx.db.patch(asase._id, { hidden: true, releaseId, position: 1 });
      return { artistId: artist._id, storm, asase: asase._id, testAvatar };
    });

    const result = await t.mutation(internal.seedReset.resetArtist, {
      handle: "amaara",
      artworkSourceUrls,
      avatarSourceUrl: AVATAR_URL,
      coverSourceUrl: COVER_URL,
    });

    expect(result).toMatchObject({
      tracksRestored: SEED_TRACK_CHUNK,
      tracksDeleted: 1,
      releasesDeleted: 1,
    });
    const after = await t.run(async (ctx) => ({
      artist: await ctx.db.get(ids.artistId),
      storm: await ctx.db.get(ids.storm),
      asase: await ctx.db.get(ids.asase),
      testAvatar: await ctx.db.get(ids.testAvatar),
      releases: await ctx.db.query("releases").collect(),
      avatar: await ctx.db
        .query("files")
        .withIndex("by_sourceUrl", (q) => q.eq("sourceUrl", AVATAR_URL))
        .unique(),
    }));
    expect(after.storm).toBeNull();
    expect(after.testAvatar).toBeNull();
    expect(after.releases).toHaveLength(0);
    expect(after.artist?.avatarFileId).toBe(after.avatar?._id);
    expect(after.asase?.hidden).toBe(false);
    expect(after.asase?.releaseId).toBeUndefined();
    expect(after.asase?.publishedAt).toBe(Date.UTC(2026, 8, 28));
  });

  it("replaces an account's playlists with public tracks and no repeated recording", async () => {
    const { t } = await seedAmaara();
    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "listener@kindred.example",
      });
      const profileId = await ctx.db.insert("profiles", {
        authUserId: userId,
        displayName: "Listener",
        genres: [],
        isAdmin: false,
        createdAt: 1,
      });
      await ctx.db.insert("playlists", {
        profileId,
        name: "Mix2",
        createdAt: 1,
      });
      return profileId;
    });

    const result = await t.mutation(internal.seedReset.replacePlaylists, {
      email: "listener@kindred.example",
    });

    expect(result).toEqual({ deleted: 1, created: ["Accra After Dark"] });
    const tracks = await t.run(async (ctx) => {
      const playlist = await ctx.db
        .query("playlists")
        .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profileId))
        .unique();
      const entries = await ctx.db
        .query("playlistEntries")
        .withIndex("by_playlist_position", (q) =>
          q.eq("playlistId", playlist?._id as Id<"playlists">)
        )
        .collect();
      return await Promise.all(
        entries.map((entry) => ctx.db.get(entry.trackId))
      );
    });
    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks.every((track) => track?.visibility === "public")).toBe(true);
    const audio = tracks.map((track) => track?.audioFileId);
    expect(new Set(audio).size).toBe(audio.length);
  });
});
