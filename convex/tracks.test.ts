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
    expect(listed.tracks).toHaveLength(1);
    expect(listed.hasMore).toBe(false);
    expect(listed.tracks[0]?.title).toBe("Accra Night");
    expect(listed.tracks[0]?.artworkUrl).toEqual(expect.any(String));
    expect(listed.tracks[0]).not.toHaveProperty("audioUrl");
    expect(listed.tracks[0]).not.toHaveProperty("audioFileId");
    expect(listed.tracks[0]?.locked).toBe(false);
    expect(JSON.stringify(listed)).not.toMatch(/audio\/mpeg/);
  });

  it("returns a short popular page and says when more tracks exist", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const artistId = await t.run(async (ctx) => {
      const artistId = await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-page",
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
      for (const title of ["Newer", "Older"]) {
        await ctx.db.insert("tracks", {
          artistId,
          title,
          audioFileId,
          visibility: "public",
          state: "published",
          publishedAt: title === "Newer" ? Date.now() : Date.now() - 1000,
          durationMs: 180000,
          peaks: makePeaks(),
          tags: [],
          genre: "Afro-soul and R&B",
          hidden: false,
          createdAt: Date.now(),
        });
      }
      return artistId;
    });

    const page = await asUser(t, userId).query(
      api.tracks.listPublishedForArtist,
      { artistId, limit: 1 }
    );
    expect(page.tracks).toHaveLength(1);
    expect(page.tracks[0]?.title).toBe("Newer");
    expect(page.hasMore).toBe(true);
    expect(JSON.stringify(page)).not.toMatch(/audio\/mpeg/);
  });

  it("opens a public track and locks a supporters-only track without the note", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const { publicId, lockedId } = await t.run(async (ctx) => {
      const artistId = await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-detail",
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
      const shared = {
        artistId,
        audioFileId,
        state: "published" as const,
        publishedAt: Date.now(),
        durationMs: 180000,
        peaks: makePeaks(),
        tags: [],
        genre: "Afro-soul and R&B",
        hidden: false,
        createdAt: Date.now(),
      };
      const publicId = await ctx.db.insert("tracks", {
        ...shared,
        title: "Asase",
        visibility: "public",
        description: "Recorded in Accra.",
      });
      const lockedId = await ctx.db.insert("tracks", {
        ...shared,
        title: "Night Mix",
        visibility: "supporters",
        description: "The rough mix stays with supporters.",
      });
      return { publicId, lockedId };
    });

    const opened = await asUser(t, userId).query(api.tracks.get, {
      trackId: publicId,
    });
    expect(opened?.title).toBe("Asase");
    expect(opened?.locked).toBe(false);
    expect(opened?.description).toBe("Recorded in Accra.");
    expect(opened).not.toHaveProperty("audioFileId");
    expect(JSON.stringify(opened)).not.toMatch(/audio\/mpeg/);

    const locked = await asUser(t, userId).query(api.tracks.get, {
      trackId: lockedId,
    });
    expect(locked?.locked).toBe(true);
    expect(locked?.description).toBeNull();
    expect(JSON.stringify(locked)).not.toMatch(/rough mix/i);
    expect(JSON.stringify(locked)).not.toMatch(/audio\/mpeg/);
  });

  it("lets the owning artist read a supporters-only note", async () => {
    const t = makeBackend();
    const { userId, trackId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "amaara.mensah@kindred.example",
        name: "Amaara Mensah",
      });
      const profileId = await ctx.db.insert("profiles", {
        authUserId: userId,
        displayName: "Amaara Mensah",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      const artistId = await ctx.db.insert("artists", {
        profileId,
        name: "Amaara Mensah",
        handle: "amaara-owner",
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
        title: "Night Mix",
        audioFileId,
        visibility: "supporters",
        state: "published",
        publishedAt: Date.now(),
        durationMs: 180000,
        peaks: makePeaks(),
        tags: [],
        description: "The rough mix stays with supporters.",
        genre: "Afro-soul and R&B",
        hidden: false,
        createdAt: Date.now(),
      });
      return { userId, trackId };
    });

    const opened = await asUser(t, userId).query(api.tracks.get, { trackId });
    expect(opened?.locked).toBe(false);
    expect(opened?.description).toBe("The rough mix stays with supporters.");
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
