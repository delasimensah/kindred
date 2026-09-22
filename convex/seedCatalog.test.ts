import { describe, expect, it } from "vitest";

import { internal } from "./_generated/api";
import { TRACK_PEAK_BUCKETS } from "./lib/tracks";
import {
  SEED_ARTWORK_COUNT,
  SEED_AUDIO_COUNT,
  SEED_TRACK_CHUNK,
} from "./lib/seedCatalog";
import { makeBackend } from "./test.setup";

function peaks() {
  return Array.from({ length: TRACK_PEAK_BUCKETS }, () => 0.25);
}

describe("seedCatalog", () => {
  it("inserts Asase once and skips it on a second run", async () => {
    const t = makeBackend();
    await t.mutation(internal.seedCatalog.upsertArtists, {});
    const storageId = await t.run(async (ctx) => {
      return await ctx.storage.store(
        new Blob(["audio"], { type: "audio/mpeg" })
      );
    });
    const audio = Array.from({ length: SEED_AUDIO_COUNT }, (_, index) => ({
      sourceUrl: `https://incompetech.com/music/royalty-free/mp3-royaltyfree/seed-${index}.mp3`,
      storageId,
      contentType: "audio/mpeg",
      sizeBytes: 5,
      credit: "Seed audio by Kevin MacLeod — CC BY 4.0",
      kind: "trackAudio" as const,
    }));
    const images = Array.from({ length: SEED_ARTWORK_COUNT }, (_, index) => ({
      sourceUrl: `seed/assets/images/artwork-${index}.png`,
      storageId,
      contentType: "image/png",
      sizeBytes: 4,
      credit: "Original Kindred seed image",
      kind: "artwork" as const,
    }));
    await t.mutation(internal.seedCatalog.registerFiles, {
      files: [...audio, ...images],
    });
    const args = {
      start: 0,
      audioSourceUrls: audio.map((file) => file.sourceUrl),
      artworkSourceUrls: images.map((file) => file.sourceUrl),
      peaks: Array.from({ length: SEED_TRACK_CHUNK }, () => peaks()),
      durationMs: Array.from({ length: SEED_TRACK_CHUNK }, () => 180_000),
    };
    const first = await t.mutation(internal.seedCatalog.insertTrackChunk, args);
    const second = await t.mutation(
      internal.seedCatalog.insertTrackChunk,
      args
    );
    expect(first.inserted).toBe(SEED_TRACK_CHUNK);
    expect(second).toEqual({ inserted: 0, skipped: SEED_TRACK_CHUNK });
    const asase = await t.run(async (ctx) => {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
        .unique();
      if (artist === null) {
        throw new Error("expected Amaara");
      }
      return await ctx.db
        .query("tracks")
        .withIndex("by_artist_title", (q) =>
          q.eq("artistId", artist._id).eq("title", "Asase")
        )
        .unique();
    });
    expect(asase?.peaks).toHaveLength(TRACK_PEAK_BUCKETS);
    expect(asase?.visibility).toBe("public");
  });

  it("marks Delasi as admin and links Amaara to her login", async () => {
    const t = makeBackend();
    await t.mutation(internal.seedCatalog.upsertArtists, {});
    await t.run(async (ctx) => {
      await ctx.db.insert("users", {
        email: "delasi.mensah@kindred.example",
        name: "Delasi Mensah",
      });
      await ctx.db.insert("users", {
        email: "amaara.mensah@kindred.example",
        name: "Amaara Mensah",
      });
      await ctx.db.insert("users", {
        email: "efua.boateng@kindred.example",
        name: "Efua Boateng",
      });
    });
    await t.mutation(internal.seedCatalog.attachProfiles, {});
    const rows = await t.run(async (ctx) => {
      const profiles = await ctx.db.query("profiles").collect();
      const amaara = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
        .unique();
      return { profiles, profileId: amaara?.profileId };
    });
    const delasi = rows.profiles.find(
      (profile) => profile.displayName === "Delasi Mensah"
    );
    const efua = rows.profiles.find(
      (profile) => profile.displayName === "Efua Boateng"
    );
    expect(delasi?.isAdmin).toBe(true);
    expect(efua?.isAdmin).toBe(false);
    expect(efua?.onboardingCompletedAt).toEqual(expect.any(Number));
    expect(rows.profileId).toBeDefined();
  });
});
