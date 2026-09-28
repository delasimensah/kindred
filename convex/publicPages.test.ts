import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, makeBackend } from "./test.setup";

async function insertAudio(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">,
  kind: "trackAudio" | "voiceNote"
) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(
      new Blob([kind], { type: "audio/mpeg" })
    );
    return await ctx.db.insert("files", {
      storageId,
      kind,
      artistId,
      contentType: "audio/mpeg",
      sizeBytes: 4,
      createdAt: Date.now(),
    });
  });
}

describe("publicPages", () => {
  it("plays public audio and keeps exclusives locked with no media url", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { email: "fan@kindred.example" });
    });
    const ids = await t.run(async (ctx) => {
      const profileId = await ctx.db.insert("profiles", {
        authUserId: userId,
        displayName: "Akosua Frimpong",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      const artistId = await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-public",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("artists", {
        name: "Hidden Act",
        handle: "hidden-act",
        bio: "Gone",
        verified: true,
        hidden: true,
        createdAt: Date.now(),
      });
      return { profileId, artistId };
    });
    const publicAudioId = await insertAudio(t, ids.artistId, "trackAudio");
    const exclusiveAudioId = await insertAudio(t, ids.artistId, "trackAudio");
    const voiceId = await insertAudio(t, ids.artistId, "voiceNote");
    const exclusiveVoiceId = await insertAudio(t, ids.artistId, "voiceNote");
    const rows = await t.run(async (ctx) => {
      const now = Date.now();
      const publicTrackId = await ctx.db.insert("tracks", {
        artistId: ids.artistId,
        title: "Asase",
        audioFileId: publicAudioId,
        visibility: "public",
        state: "published",
        publishedAt: now,
        durationMs: 180000,
        peaks: [0.2],
        tags: [],
        genre: "Afro-soul and R&B",
        description: "Recorded in Accra.",
        hidden: false,
        createdAt: now,
      });
      const exclusiveTrackId = await ctx.db.insert("tracks", {
        artistId: ids.artistId,
        title: "Night Mix",
        audioFileId: exclusiveAudioId,
        visibility: "supporters",
        state: "published",
        publishedAt: now - 1000,
        durationMs: 200000,
        peaks: [0.4],
        tags: [],
        genre: "Afro-soul and R&B",
        description: "Supporters only mix notes.",
        hidden: false,
        createdAt: now,
      });
      await ctx.db.insert("tracks", {
        artistId: ids.artistId,
        title: "Still a draft",
        audioFileId: publicAudioId,
        visibility: "public",
        state: "draft",
        durationMs: 1000,
        peaks: [],
        tags: [],
        genre: "Afro-soul and R&B",
        hidden: false,
        createdAt: now,
      });
      const everyonePostId = await ctx.db.insert("updatePosts", {
        artistId: ids.artistId,
        body: "Asase is finished.",
        voiceFileId: voiceId,
        voiceDurationMs: 42000,
        audience: "everyone",
        hidden: false,
        createdAt: now,
      });
      const exclusivePostId = await ctx.db.insert("updatePosts", {
        artistId: ids.artistId,
        body: "SECRET EXCLUSIVE BODY",
        voiceFileId: exclusiveVoiceId,
        voiceDurationMs: 9000,
        audience: "supporters",
        hidden: false,
        createdAt: now - 1000,
      });
      await ctx.db.insert("mixes", {
        profileId: ids.profileId,
        prompt: "late night",
        name: "Late Night Highlife",
        why: "A slow wind-down.",
        trackIds: [publicTrackId, exclusiveTrackId],
        slug: "late-night",
        createdAt: now,
      });
      return {
        publicTrackId,
        exclusiveTrackId,
        everyonePostId,
        exclusivePostId,
      };
    });

    const page = await t.query(api.publicPages.artist, {
      handle: "amaara-public",
    });
    expect(page?.name).toBe("Amaara Mensah");
    expect(page?.tracks.map((row) => row.title)).toEqual([
      "Asase",
      "Night Mix",
    ]);
    expect(page?.tracks.find((row) => row.title === "Night Mix")?.locked).toBe(
      true
    );
    expect(page?.posts.find((row) => row.locked)?.preview).toBeNull();
    expect(JSON.stringify(page)).not.toMatch(/audioUrl|SECRET EXCLUSIVE BODY/);
    expect(
      await t.query(api.publicPages.artist, { handle: "hidden-act" })
    ).toBe(null);

    const publicSource = await t.query(api.publicPages.playbackUrl, {
      trackId: rows.publicTrackId,
    });
    expect(publicSource?.audioUrl).toEqual(expect.any(String));
    expect(
      await t.query(api.publicPages.playbackUrl, {
        trackId: rows.exclusiveTrackId,
      })
    ).toBeNull();
    expect(
      await asUser(t, userId).query(api.publicPages.playbackUrl, {
        trackId: rows.exclusiveTrackId,
      })
    ).toBeNull();

    const openPost = await t.query(api.publicPages.post, {
      postId: rows.everyonePostId,
    });
    expect(openPost?.body).toBe("Asase is finished.");
    expect(openPost?.hasVoice).toBe(true);
    expect(openPost).not.toHaveProperty("voiceUrl");
    const lockedPost = await t.query(api.publicPages.post, {
      postId: rows.exclusivePostId,
    });
    expect(lockedPost?.locked).toBe(true);
    expect(lockedPost?.body).toBeNull();
    expect(lockedPost?.hasVoice).toBe(false);
    expect(
      await t.query(api.publicPages.voiceUrl, { postId: rows.exclusivePostId })
    ).toBeNull();
    expect(
      (
        await t.query(api.publicPages.voiceUrl, {
          postId: rows.everyonePostId,
        })
      )?.audioUrl
    ).toEqual(expect.any(String));

    const trackPage = await t.query(api.publicPages.track, {
      trackId: rows.exclusiveTrackId,
    });
    expect(trackPage?.track.locked).toBe(true);
    expect(trackPage?.description).toBeNull();
    expect(JSON.stringify(trackPage)).not.toMatch(/audioUrl|Supporters only/);

    const mixPage = await t.query(api.publicPages.mix, { slug: "late-night" });
    expect(mixPage?.curatorName).toBe("Akosua Frimpong");
    expect(mixPage?.tracks.map((row) => row.locked)).toEqual([false, true]);
    expect(JSON.stringify(mixPage)).not.toMatch(/audioUrl/);
  });
});
