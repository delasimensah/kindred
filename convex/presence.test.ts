import { describe, expect, it } from "vitest";

import { PRESENCE_FRESH_MS } from "./lib/presence";
import { api, internal } from "./_generated/api";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function twoFansAndTrack() {
  const t = makeBackend();
  const ids = await t.run(async (ctx) => {
    const makeUser = async (email: string, name: string) => {
      const userId = await ctx.db.insert("users", { email, name });
      const profileId = await ctx.db.insert("profiles", {
        authUserId: userId,
        displayName: name,
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      return { userId, profileId };
    };
    const efua = await makeUser("efua.boateng@kindredmail.com", "Efua Boateng");
    const kofi = await makeUser("kofi.mensah@kindredmail.com", "Kofi Mensah");
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
    const trackId = await ctx.db.insert("tracks", {
      artistId,
      title: "Asase",
      audioFileId,
      visibility: "public",
      state: "published",
      publishedAt: Date.now(),
      durationMs: 180000,
      peaks: Array.from({ length: TRACK_PEAK_BUCKETS }, () => 0.4),
      tags: [],
      genre: "Afro-soul and R&B",
      hidden: false,
      createdAt: Date.now(),
    });
    const lockedId = await ctx.db.insert("tracks", {
      artistId,
      title: "Night Mix",
      audioFileId,
      visibility: "supporters",
      state: "published",
      publishedAt: Date.now(),
      durationMs: 180000,
      peaks: Array.from({ length: TRACK_PEAK_BUCKETS }, () => 0.4),
      tags: [],
      genre: "Afro-soul and R&B",
      hidden: false,
      createdAt: Date.now(),
    });
    return { ...efua, kofi, artistId, trackId, lockedId };
  });
  return { t, ...ids };
}

describe("presence.heartbeat", () => {
  it("patches one row per profile and counts only fresh beats", async () => {
    const { t, userId, kofi, artistId, trackId } = await twoFansAndTrack();
    await asUser(t, userId).mutation(api.presence.heartbeat, {
      artistId,
      trackId,
    });
    await asUser(t, userId).mutation(api.presence.heartbeat, {
      artistId,
      trackId,
    });
    await asUser(t, kofi.userId).mutation(api.presence.heartbeat, {
      artistId,
      trackId,
    });
    const count = await asUser(t, userId).query(api.presence.countForArtist, {
      artistId,
    });
    expect(count).toBe(2);
    const rows = await t.run(async (ctx) => {
      return await ctx.db.query("presenceHeartbeats").collect();
    });
    expect(rows).toHaveLength(2);
  });

  it("drops a listener from the count after the freshness window", async () => {
    const { t, userId, artistId, trackId } = await twoFansAndTrack();
    await asUser(t, userId).mutation(api.presence.heartbeat, {
      artistId,
      trackId,
    });
    await t.run(async (ctx) => {
      const row = await ctx.db.query("presenceHeartbeats").first();
      if (row === null) {
        throw new Error("expected a heartbeat row");
      }
      await ctx.db.patch(row._id, {
        lastBeatAt: Date.now() - PRESENCE_FRESH_MS - 1_000,
      });
    });
    const count = await asUser(t, userId).query(api.presence.countForArtist, {
      artistId,
    });
    expect(count).toBe(0);
  });

  it("refuses a heartbeat for a track this person cannot play", async () => {
    const { t, userId, artistId, lockedId } = await twoFansAndTrack();
    try {
      await asUser(t, userId).mutation(api.presence.heartbeat, {
        artistId,
        trackId: lockedId,
      });
      throw new Error("expected the heartbeat to be refused");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });
});

describe("presence.cleanup", () => {
  it("deletes rows older than ten minutes", async () => {
    const { t, userId, artistId, trackId } = await twoFansAndTrack();
    await asUser(t, userId).mutation(api.presence.heartbeat, {
      artistId,
      trackId,
    });
    await t.run(async (ctx) => {
      const row = await ctx.db.query("presenceHeartbeats").first();
      if (row === null) {
        throw new Error("expected a heartbeat row");
      }
      await ctx.db.patch(row._id, {
        lastBeatAt: Date.now() - 11 * 60_000,
      });
    });
    const deleted = await t.mutation(internal.presence.cleanup, {});
    expect(deleted).toBe(1);
    const left = await t.run(async (ctx) => {
      return await ctx.db.query("presenceHeartbeats").collect();
    });
    expect(left).toHaveLength(0);
  });
});
