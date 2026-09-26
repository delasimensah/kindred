import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { asUser, makeBackend } from "./test.setup";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";

function makePeaks() {
  return Array.from({ length: TRACK_PEAK_BUCKETS }, (_, index) =>
    Number((index % 10) / 10)
  );
}

describe("releases", () => {
  it("lists published albums for an artist and opens album detail", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const { artistId, releaseId } = await t.run(async (ctx) => {
      const artistId = await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-albums",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      const audioStorageId = await ctx.storage.store(
        new Blob(["audio"], { type: "audio/mpeg" })
      );
      const artStorageId = await ctx.storage.store(
        new Blob(["art"], { type: "image/jpeg" })
      );
      const audioFileId = await ctx.db.insert("files", {
        storageId: audioStorageId,
        kind: "trackAudio",
        artistId,
        contentType: "audio/mpeg",
        sizeBytes: 5,
        createdAt: Date.now(),
      });
      const artworkFileId = await ctx.db.insert("files", {
        storageId: artStorageId,
        kind: "artwork",
        artistId,
        contentType: "image/jpeg",
        sizeBytes: 3,
        createdAt: Date.now(),
      });
      const releaseId = await ctx.db.insert("releases", {
        artistId,
        title: "Lagoon Sessions",
        type: "ep",
        artworkFileId,
        visibility: "public",
        state: "published",
        publishedAt: Date.now(),
        genre: "Afro-soul and R&B",
        tags: [],
        hidden: false,
        createdAt: Date.now(),
      });
      for (let index = 0; index < 3; index += 1) {
        await ctx.db.insert("tracks", {
          artistId,
          title: `Song ${index + 1}`,
          audioFileId,
          artworkFileId,
          visibility: "public",
          state: "published",
          publishedAt: Date.now() - index,
          durationMs: 180000,
          peaks: makePeaks(),
          tags: [],
          genre: "Afro-soul and R&B",
          hidden: false,
          releaseId,
          position: index,
          createdAt: Date.now(),
        });
      }
      return { artistId, releaseId };
    });

    const listed = await asUser(t, userId).query(
      api.releases.listPublishedForArtist,
      { artistId }
    );
    expect(listed.albums).toHaveLength(1);
    expect(listed.hasMore).toBe(false);
    expect(listed.albums[0]?.title).toBe("Lagoon Sessions");
    expect(listed.albums[0]?.trackCount).toBe(3);

    const detail = await asUser(t, userId).query(api.releases.get, {
      releaseId,
    });
    expect(detail?.tracks).toHaveLength(3);
    expect(detail?.tracks[0]?.title).toBe("Song 1");
  });

  it("returns hasMore when the artist has more albums than the preview limit", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "kwame.mensah@kindredmail.com",
        name: "Kwame Mensah",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const artistId = await t.run(async (ctx) => {
      const artistId = await ctx.db.insert("artists", {
        name: "Many Albums",
        handle: "many-albums",
        bio: "Test",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      const artStorageId = await ctx.storage.store(
        new Blob(["art"], { type: "image/jpeg" })
      );
      const artworkFileId = await ctx.db.insert("files", {
        storageId: artStorageId,
        kind: "artwork",
        artistId,
        contentType: "image/jpeg",
        sizeBytes: 3,
        createdAt: Date.now(),
      });
      for (let index = 0; index < 8; index += 1) {
        await ctx.db.insert("releases", {
          artistId,
          title: `Release ${index + 1}`,
          type: index % 2 === 0 ? "ep" : "album",
          artworkFileId,
          visibility: "public",
          state: "published",
          publishedAt: Date.now() - index,
          genre: "Afro-soul and R&B",
          tags: [],
          hidden: false,
          createdAt: Date.now(),
        });
      }
      return artistId;
    });

    const preview = await asUser(t, userId).query(
      api.releases.listPublishedForArtist,
      { artistId, limit: 6 }
    );
    expect(preview.albums).toHaveLength(6);
    expect(preview.hasMore).toBe(true);

    const all = await asUser(t, userId).query(
      api.releases.listPublishedForArtist,
      { artistId }
    );
    expect(all.albums).toHaveLength(8);
    expect(all.hasMore).toBe(false);
  });
});
