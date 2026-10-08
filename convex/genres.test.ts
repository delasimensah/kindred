import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { makeBackend } from "./test.setup";

async function insertTrack(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">,
  title: string,
  genre: string,
  publishedAt: number,
  extras: { hidden?: boolean; visibility?: "public" | "supporters" } = {}
) {
  await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(new Blob(["audio"]));
    const audioFileId = await ctx.db.insert("files", {
      storageId,
      kind: "trackAudio",
      artistId,
      contentType: "audio/mpeg",
      sizeBytes: 5,
      createdAt: publishedAt,
    });
    await ctx.db.insert("tracks", {
      artistId,
      title,
      audioFileId,
      visibility: extras.visibility ?? "public",
      state: "published",
      publishedAt,
      durationMs: 1000,
      peaks: [0.2],
      tags: [],
      genre,
      hidden: extras.hidden ?? false,
      createdAt: publishedAt,
    });
  });
}

describe("genres", () => {
  it("lists a tile and the newest public tracks for that genre", async () => {
    const t = makeBackend();
    const artistId = await t.run(async (ctx) => {
      return await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-genre",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });
    const now = Date.now();
    await insertTrack(t, artistId, "Older", "Highlife", now - 1000);
    await insertTrack(t, artistId, "Newest", "Highlife", now);
    await insertTrack(t, artistId, "Locked", "Highlife", now + 1, {
      visibility: "supporters",
    });
    await insertTrack(t, artistId, "Hidden", "Gospel", now, { hidden: true });

    const tiles = await t.query(api.genres.tiles, {});
    expect(tiles).toEqual([{ genre: "Highlife", artworkUrl: null }]);

    const page = await t.query(api.genres.page, { genre: "Highlife" });
    expect(page?.artists.map((artist) => artist.name)).toEqual([
      "Amaara Mensah",
    ]);
    expect(page?.tracks.map((track) => track.title)).toEqual([
      "Newest",
      "Older",
    ]);
    expect(await t.query(api.genres.page, { genre: "Not a genre" })).toBeNull();
  });
});
