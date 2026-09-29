import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, makeBackend } from "./test.setup";

async function fan(t: ReturnType<typeof makeBackend>) {
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "akosua.frimpong@kindred.example",
      name: "Akosua Frimpong",
    });
  });
  await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
  return userId;
}

async function insertArtist(
  t: ReturnType<typeof makeBackend>,
  name: string,
  handle: string,
  extra: { hidden?: boolean; bio?: string } = {}
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("artists", {
      name,
      handle,
      bio: extra.bio ?? "Afro-soul and R&B · Accra",
      verified: true,
      hidden: extra.hidden ?? false,
      createdAt: Date.now(),
    });
  });
}

async function insertTrack(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">,
  title: string,
  extra: {
    state?: "draft" | "scheduled" | "published";
    hidden?: boolean;
    visibility?: "public" | "supporters";
  } = {}
) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(
      new Blob(["audio"], { type: "audio/mpeg" })
    );
    const audioFileId = await ctx.db.insert("files", {
      storageId,
      kind: "trackAudio",
      artistId,
      contentType: "audio/mpeg",
      sizeBytes: 5,
      createdAt: Date.now(),
    });
    const state = extra.state ?? "published";
    return await ctx.db.insert("tracks", {
      artistId,
      title,
      audioFileId,
      visibility: extra.visibility ?? "public",
      state,
      publishedAt: state === "published" ? Date.now() : undefined,
      durationMs: 180000,
      peaks: [0],
      tags: [],
      genre: "Afro-soul and R&B",
      hidden: extra.hidden ?? false,
      createdAt: Date.now(),
    });
  });
}

describe("search.exact", () => {
  it("returns artist names before track titles and keeps locked rows locked", async () => {
    const t = makeBackend();
    const userId = await fan(t);
    const query = (term: string) =>
      asUser(t, userId).query(api.search.exact, { term });

    expect(await query("a")).toEqual({ artists: [], tracks: [] });
    expect(await query("!!")).toEqual({ artists: [], tracks: [] });

    const amaara = await insertArtist(t, "Amaara Mensah", "amaara");
    await insertArtist(t, "Hidden Name", "hidden", { hidden: true });
    await insertTrack(t, amaara, "Asase");
    await insertTrack(t, amaara, "Draft Only", { state: "draft" });
    await insertTrack(t, amaara, "Quiet Room", { visibility: "supporters" });
    const hiddenArtist = await insertArtist(t, "Secret Act", "secret", {
      hidden: true,
    });
    await insertTrack(t, hiddenArtist, "Secret Song");

    const byArtist = await query("Amaara");
    expect(byArtist.artists.map((row) => row.name)).toEqual(["Amaara Mensah"]);
    expect(byArtist.artists[0]?.detail).toBe("Artist · Afro-soul and R&B");
    expect(byArtist.artists[0]?.isFollowed).toBe(false);
    expect(byArtist.tracks).toEqual([]);
    expect(JSON.stringify(byArtist)).not.toMatch(/audio/);

    await asUser(t, userId).mutation(api.follows.add, { artistId: amaara });
    const followed = await query("Amaara");
    expect(followed.artists[0]?.isFollowed).toBe(true);

    const byTitle = await query("Asase");
    expect(byTitle.artists).toEqual([]);
    expect(byTitle.tracks.map((row) => row.title)).toEqual(["Asase"]);
    expect(byTitle.tracks[0]?.locked).toBe(false);
    expect(byTitle.tracks[0]?.artistName).toBe("Amaara Mensah");

    const locked = await query("Quiet");
    expect(locked.tracks.map((row) => row.title)).toEqual(["Quiet Room"]);
    expect(locked.tracks[0]?.locked).toBe(true);

    expect(await query("Draft")).toEqual({ artists: [], tracks: [] });
    expect(await query("Secret")).toEqual({ artists: [], tracks: [] });
  });
});
