import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import { asUser, makeBackend } from "./test.setup";

function makePeaks() {
  return Array.from({ length: TRACK_PEAK_BUCKETS }, (_, index) =>
    Number((index % 10) / 10)
  );
}

describe("tracks", () => {
  it("lists published tracks without audio urls", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.mutation(internal.seed.onboardingArtists, {});

    const artistId = await t.run(async (ctx) => {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
        .unique();
      if (artist === null) {
        throw new Error("expected Amaara");
      }
      const audioStorageId = await ctx.storage.store(
        new Blob(["audio"], { type: "audio/mpeg" })
      );
      const artworkStorageId = await ctx.storage.store(
        new Blob(["art"], { type: "image/jpeg" })
      );
      const audioFileId = await ctx.db.insert("files", {
        storageId: audioStorageId,
        kind: "trackAudio",
        artistId: artist._id,
        contentType: "audio/mpeg",
        sizeBytes: 5,
        createdAt: Date.now(),
      });
      const artworkFileId = await ctx.db.insert("files", {
        storageId: artworkStorageId,
        kind: "artwork",
        artistId: artist._id,
        contentType: "image/jpeg",
        sizeBytes: 3,
        createdAt: Date.now(),
      });
      await ctx.db.insert("tracks", {
        artistId: artist._id,
        title: "Accra Night",
        audioFileId,
        artworkFileId,
        visibility: "public",
        state: "published",
        publishedAt: Date.now(),
        durationMs: 180000,
        peaks: makePeaks(),
        tags: [],
        genre: "Afro-soul and R&B",
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("tracks", {
        artistId: artist._id,
        title: "Draft Only",
        audioFileId,
        visibility: "public",
        state: "draft",
        durationMs: 120000,
        peaks: makePeaks(),
        tags: [],
        genre: "Afro-soul and R&B",
        hidden: false,
        createdAt: Date.now(),
      });
      return artist._id;
    });

    const listed = await asUser(t, userId).query(
      api.tracks.listPublishedForArtist,
      { artistId }
    );
    expect(listed).toHaveLength(1);
    expect(listed[0]?.title).toBe("Accra Night");
    expect(listed[0]?.artworkUrl).toEqual(expect.any(String));
    expect(listed[0]).not.toHaveProperty("audioUrl");
    expect(listed[0]).not.toHaveProperty("audioFileId");
    expect(JSON.stringify(listed)).not.toMatch(/audio\/mpeg/);
  });

  it("stores a liked library row against a track", async () => {
    const t = makeBackend();
    const { profileId, trackId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
      const profileId = await ctx.db.insert("profiles", {
        authUserId: userId,
        displayName: "Efua Boateng",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      const artistId = await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-lib",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      const audioStorageId = await ctx.storage.store(
        new Blob(["audio"], { type: "audio/mpeg" })
      );
      const audioFileId = await ctx.db.insert("files", {
        storageId: audioStorageId,
        kind: "trackAudio",
        artistId,
        contentType: "audio/mpeg",
        sizeBytes: 5,
        createdAt: Date.now(),
      });
      const trackId = await ctx.db.insert("tracks", {
        artistId,
        title: "Accra Night",
        audioFileId,
        visibility: "public",
        state: "published",
        publishedAt: Date.now(),
        durationMs: 180000,
        peaks: makePeaks(),
        tags: [],
        genre: "Afro-soul and R&B",
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("libraryItems", {
        profileId,
        trackId,
        kind: "liked",
        createdAt: Date.now(),
      });
      return { profileId, trackId };
    });

    const liked = await t.run(async (ctx) => {
      return await ctx.db
        .query("libraryItems")
        .withIndex("by_profile_track", (q) =>
          q.eq("profileId", profileId).eq("trackId", trackId)
        )
        .unique();
    });
    expect(liked?.kind).toBe("liked");
  });
});
