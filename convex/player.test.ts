import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import { asUser, makeBackend } from "./test.setup";

describe("player.resolveQueueAccess", () => {
  it("marks a public track playable and a supporters-only track locked", async () => {
    const t = makeBackend();
    const { userId, publicId, lockedId } = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
      await ctx.db.insert("profiles", {
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
        peaks: Array.from({ length: TRACK_PEAK_BUCKETS }, () => 0.2),
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
      return { userId, publicId, lockedId };
    });

    const rows = await asUser(t, userId).query(api.player.resolveQueueAccess, {
      trackIds: [publicId, lockedId],
    });
    expect(rows).toEqual([
      { trackId: publicId, playable: true },
      { trackId: lockedId, playable: false },
    ]);
    expect(JSON.stringify(rows)).not.toMatch(/http/);
  });
});
