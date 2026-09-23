import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { errorCode, asUser, makeBackend } from "./test.setup";

async function fanWithTrack(visibility: "public" | "supporters" = "public") {
  const t = makeBackend();
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "efua.boateng@kindredmail.com",
      name: "Efua Boateng",
    });
  });
  const fan = asUser(t, userId);
  await fan.mutation(api.profiles.ensureProfile, {});
  await t.mutation(internal.seed.onboardingArtists, {});
  const trackId = await t.run(async (ctx) => {
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
      .unique();
    if (artist === null) {
      throw new Error("expected Amaara");
    }
    const storageId = await ctx.storage.store(new Blob(["audio"]));
    const audioFileId = await ctx.db.insert("files", {
      storageId,
      kind: "trackAudio",
      artistId: artist._id,
      contentType: "audio/mpeg",
      sizeBytes: 5,
      createdAt: Date.now(),
    });
    return await ctx.db.insert("tracks", {
      artistId: artist._id,
      title: "Accra Night",
      audioFileId,
      visibility,
      state: "published",
      publishedAt: Date.now(),
      durationMs: 180000,
      peaks: [0.2],
      tags: [],
      genre: "Afro-soul and R&B",
      hidden: false,
      createdAt: Date.now(),
    });
  });
  return { t, fan, trackId };
}

describe("library", () => {
  it("creates a private playlist and adds then removes a track", async () => {
    const { t, fan, trackId } = await fanWithTrack();
    const playlistId = await fan.mutation(api.library.createPlaylist, {
      name: "  Late night  ",
    });
    await fan.mutation(api.library.addTrack, { playlistId, trackId });
    const listed = await fan.query(api.library.listPlaylists, {});
    expect(listed).toHaveLength(1);
    expect(listed[0]?.trackCount).toBe(1);
    expect(listed[0]?.artworkUrls).toEqual([]);
    const playlist = await fan.query(api.library.getPlaylist, { playlistId });
    expect(playlist?.name).toBe("Late night");
    expect(playlist?.tracks).toHaveLength(1);
    expect(playlist?.tracks[0]?.locked).toBe(false);
    expect(JSON.stringify(playlist)).not.toContain("audio/mpeg");

    const otherId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "other@kindredmail.com",
        name: "Other",
      });
    });
    const other = asUser(t, otherId);
    await other.mutation(api.profiles.ensureProfile, {});
    const hidden = await other.query(api.library.getPlaylist, { playlistId });
    expect(hidden).toBeNull();

    await fan.mutation(api.library.removeTrack, { playlistId, trackId });
    const emptied = await fan.query(api.library.getPlaylist, { playlistId });
    expect(emptied?.tracks).toHaveLength(0);

    await expect(
      other.mutation(api.library.deletePlaylist, { playlistId })
    ).rejects.toSatisfy(
      (error: unknown) => errorCode(error) === "NOT_PERMITTED"
    );
    await fan.mutation(api.library.deletePlaylist, { playlistId });
    expect(await fan.query(api.library.listPlaylists, {})).toEqual([]);
    expect(await fan.query(api.library.getPlaylist, { playlistId })).toBeNull();
  });

  it("likes a track for the signed-in fan and locks a supporters-only playlist row", async () => {
    const { fan, trackId } = await fanWithTrack("supporters");
    await fan.mutation(api.library.setLiked, { trackId, liked: true });
    const liked = await fan.query(api.library.listLiked, {});
    expect(liked).toHaveLength(1);
    expect(liked[0]?.locked).toBe(true);
    expect(liked[0]?.title).toBe("Accra Night");
    await fan.mutation(api.library.setLiked, { trackId, liked: false });
    expect(await fan.query(api.library.listLiked, {})).toHaveLength(0);
  });

  it("rejects an empty playlist name", async () => {
    const { fan } = await fanWithTrack();
    await expect(
      fan.mutation(api.library.createPlaylist, { name: "   " })
    ).rejects.toSatisfy((error: unknown) => errorCode(error) === "INVALID");
  });
});
