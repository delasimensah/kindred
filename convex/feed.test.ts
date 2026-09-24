import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { asUser, makeBackend } from "./test.setup";

describe("feed", () => {
  it("shows followed updates, hides a locked body, and includes a voice note", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.run(async (ctx) => {
      const profile = await ctx.db.query("profiles").first();
      if (profile === null) {
        throw new Error("profile missing");
      }
      const followed = await ctx.db.insert("artists", {
        name: "Sela Okoro",
        handle: "sela-feed",
        bio: "Amapiano · Lagos",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      const other = await ctx.db.insert("artists", {
        name: "Kweku Darko",
        handle: "kweku-feed",
        bio: "Highlife · Kumasi",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("follows", {
        profileId: profile._id,
        artistId: followed,
        createdAt: Date.now(),
      });
      const audioId = await ctx.db.insert("files", {
        storageId: await ctx.storage.store(new Blob(["voice"])),
        kind: "voiceNote",
        contentType: "audio/mpeg",
        sizeBytes: 5,
        createdAt: Date.now(),
      });
      const photoId = await ctx.db.insert("files", {
        storageId: await ctx.storage.store(new Blob(["photo"])),
        kind: "updatePhoto",
        contentType: "image/jpeg",
        sizeBytes: 5,
        createdAt: Date.now(),
      });
      await ctx.db.insert("updatePosts", {
        artistId: followed,
        body: "The log drum finally sat in the pocket.",
        audience: "everyone",
        voiceFileId: audioId,
        voiceDurationMs: 42_000,
        voicePeaks: [0.2, 0.8],
        photoFileId: photoId,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("updatePosts", {
        artistId: followed,
        body: "The rough mix stays with supporters.",
        audience: "supporters",
        photoFileId: photoId,
        hidden: false,
        createdAt: Date.now() - 1000,
      });
      await ctx.db.insert("updatePosts", {
        artistId: other,
        body: "This belongs to someone else.",
        audience: "everyone",
        hidden: false,
        createdAt: Date.now(),
      });
      const trackAudio = await ctx.db.insert("files", {
        storageId: await ctx.storage.store(new Blob(["track"])),
        kind: "trackAudio",
        contentType: "audio/mpeg",
        sizeBytes: 5,
        createdAt: Date.now(),
      });
      await ctx.db.insert("tracks", {
        artistId: followed,
        title: "Asase",
        audioFileId: trackAudio,
        visibility: "public",
        state: "published",
        publishedAt: Date.now() - 500,
        durationMs: 180000,
        peaks: [],
        tags: [],
        genre: "Amapiano",
        hidden: false,
        createdAt: Date.now() - 500,
      });
    });

    const feed = await asUser(t, userId).query(api.feed.listForMe, {});
    const posts = feed.filter((item) => item.kind === "post");
    const voice = posts.find((item) => item.voiceDurationMs === 42_000);
    expect(voice?.body).toBe("The log drum finally sat in the pocket.");
    expect(voice?.voiceUrl).toEqual(expect.any(String));
    expect(voice?.photoUrl).toEqual(expect.any(String));
    expect(voice?.voicePeaks).toEqual([0.2, 0.8]);
    const locked = posts.find((item) => item.locked);
    expect(locked?.body).toBeNull();
    expect(locked?.kind === "post" ? locked.photoUrl : null).toBeNull();
    expect(JSON.stringify(feed)).not.toMatch(/rough mix/i);
    expect(JSON.stringify(feed)).not.toMatch(/someone else/i);
    expect(feed.some((item) => item.kind === "release")).toBe(true);
  });
});
