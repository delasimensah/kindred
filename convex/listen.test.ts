import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function fanAndTracks() {
  const t = makeBackend();
  const ids = await t.run(async (ctx) => {
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
      handle: "amaara",
      bio: "Afro-soul",
      verified: true,
      hidden: false,
      createdAt: Date.now(),
    });
    const audioStorageId = await ctx.storage.store(new Blob(["audio"]));
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
      peaks: Array.from({ length: TRACK_PEAK_BUCKETS }, () => 0.4),
      tags: [],
      genre: "Afro-soul and R&B",
      hidden: false,
      createdAt: Date.now(),
    };
    const publicId = await ctx.db.insert("tracks", {
      ...shared,
      title: "Asase",
      visibility: "public",
    });
    const lockedId = await ctx.db.insert("tracks", {
      ...shared,
      title: "Night Mix",
      visibility: "supporters",
    });
    return { userId, profileId, artistId, publicId, lockedId };
  });
  return { t, ...ids };
}

describe("listen.record", () => {
  it("writes one listen and ignores the same play sent twice", async () => {
    const { t, userId, profileId, artistId, publicId } = await fanAndTracks();
    const args = {
      trackId: publicId,
      artistId,
      startedAt: 1_700_000_000_000,
      msPlayed: 31_000,
      completed: false,
      source: "artist" as const,
      clientEventId: "play-asase-1",
    };
    await asUser(t, userId).mutation(api.listen.record, args);
    await asUser(t, userId).mutation(api.listen.record, args);
    const rows = await t.run(async (ctx) => {
      return await ctx.db.query("listenEvents").collect();
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.profileId).toBe(profileId);
    expect(rows[0]?.trackId).toBe(publicId);
  });

  it("refuses a listen for a track this person cannot play", async () => {
    const { t, userId, artistId, lockedId } = await fanAndTracks();
    try {
      await asUser(t, userId).mutation(api.listen.record, {
        trackId: lockedId,
        artistId,
        startedAt: 1,
        msPlayed: 31_000,
        completed: false,
        source: "library",
        clientEventId: "play-locked",
      });
      throw new Error("expected the listen to be refused");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });
});
