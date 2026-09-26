import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function seedVerifiedArtist(t: ReturnType<typeof makeBackend>) {
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "amaara.mensah@kindred.example",
      name: "Amaara Mensah",
    });
  });
  const profileId = await asUser(t, userId).mutation(
    api.profiles.ensureProfile,
    {}
  );
  const artistId = await t.run(async (ctx) => {
    return await ctx.db.insert("artists", {
      profileId,
      name: "Amaara Mensah",
      handle: "amaara",
      bio: "Highlife from Accra",
      verified: true,
      hidden: false,
      createdAt: Date.now(),
    });
  });
  return { userId, artistId };
}

async function seedOwnedFile(
  t: ReturnType<typeof makeBackend>,
  artistId: Id<"artists">,
  kind: "trackAudio" | "artwork",
  contentType: string
) {
  return await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(new Blob(["bytes"]));
    return await ctx.db.insert("files", {
      storageId,
      kind,
      artistId,
      contentType,
      sizeBytes: 12,
      createdAt: Date.now(),
    });
  });
}

const peaks = Array.from({ length: 1000 }, (_, index) =>
  index === 0 ? 1 : 0.1
);

describe("studioTracks", () => {
  it("creates a draft and publishes now", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const trackId = await asArtist.mutation(api.studioTracks.createDraft, {
      title: "Kokrobite Sessions",
      audioFileId,
      artworkFileId,
      visibility: "public",
      durationMs: 180000,
      peaks,
      tags: ["Highlife", "accra"],
      description: "Live beach sessions",
      genre: "Highlife",
    });

    await asArtist.mutation(api.studioTracks.publishNow, { trackId });
    const mine = await asArtist.query(api.studioTracks.getMine, { trackId });
    expect(mine).toMatchObject({
      title: "Kokrobite Sessions",
      state: "published",
      visibility: "public",
    });
    expect(mine?.publishedAt).toEqual(expect.any(Number));
  });

  it("updates release details and cover art", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const nextArtworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/png"
    );
    const asArtist = asUser(t, userId);
    const trackId = await asArtist.mutation(api.studioTracks.createDraft, {
      title: "Old title",
      audioFileId,
      artworkFileId,
      visibility: "public",
      durationMs: 1000,
      peaks,
      tags: [],
      genre: "Afrobeats",
    });

    await asArtist.mutation(api.studioTracks.update, {
      trackId,
      title: "New title",
      tags: ["accra"],
      genre: "Highlife",
      visibility: "supporters",
      artworkFileId: nextArtworkFileId,
    });

    const mine = await asArtist.query(api.studioTracks.getMine, { trackId });
    expect(mine).toMatchObject({
      title: "New title",
      genre: "Highlife",
      visibility: "supporters",
      tags: ["accra"],
    });
    expect(mine?.artworkUrl).toEqual(expect.any(String));
  });

  it("schedules a release and publishScheduled flips it when due", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const trackId = await asArtist.mutation(api.studioTracks.createDraft, {
      title: "Scheduled One",
      audioFileId,
      artworkFileId,
      visibility: "supporters",
      durationMs: 90000,
      peaks,
      tags: [],
      genre: "Afrobeats",
    });

    await asArtist.mutation(api.studioTracks.schedule, {
      trackId,
      publishAt: Date.now() + 60_000,
    });
    expect(
      (await asArtist.query(api.studioTracks.getMine, { trackId }))?.state
    ).toBe("scheduled");

    await t.run(async (ctx) => {
      await ctx.db.patch(trackId, { publishAt: Date.now() - 1000 });
    });
    await t.mutation(internal.studioTracks.publishScheduled, { trackId });

    expect(
      (await asArtist.query(api.studioTracks.getMine, { trackId }))?.state
    ).toBe("published");
  });

  it("cancelled schedule is a no-op for publishScheduled", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const trackId = await asArtist.mutation(api.studioTracks.createDraft, {
      title: "Cancelled",
      audioFileId,
      artworkFileId,
      visibility: "public",
      durationMs: 60000,
      peaks,
      tags: [],
      genre: "Alté",
    });
    await asArtist.mutation(api.studioTracks.schedule, {
      trackId,
      publishAt: Date.now() + 120_000,
    });
    await asArtist.mutation(api.studioTracks.cancelSchedule, { trackId });
    await t.mutation(internal.studioTracks.publishScheduled, { trackId });

    expect(
      (await asArtist.query(api.studioTracks.getMine, { trackId }))?.state
    ).toBe("draft");
  });

  it("reschedules a scheduled release and publishes a cancelled draft", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);

    const trackId = await asArtist.mutation(api.studioTracks.createDraft, {
      title: "Move me",
      audioFileId,
      artworkFileId,
      visibility: "public",
      durationMs: 60000,
      peaks,
      tags: [],
      genre: "Afrobeats",
    });
    const firstAt = Date.now() + 60_000;
    await asArtist.mutation(api.studioTracks.schedule, {
      trackId,
      publishAt: firstAt,
    });
    const secondAt = Date.now() + 180_000;
    await asArtist.mutation(api.studioTracks.schedule, {
      trackId,
      publishAt: secondAt,
    });
    expect(
      (await asArtist.query(api.studioTracks.getMine, { trackId }))?.publishAt
    ).toBe(secondAt);

    await asArtist.mutation(api.studioTracks.cancelSchedule, { trackId });
    await asArtist.mutation(api.studioTracks.publishNow, { trackId });
    expect(
      (await asArtist.query(api.studioTracks.getMine, { trackId }))?.state
    ).toBe("published");
  });

  it("refuses peaks that are not 1000 buckets", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );

    try {
      await asUser(t, userId).mutation(api.studioTracks.createDraft, {
        title: "Bad peaks",
        audioFileId,
        artworkFileId,
        visibility: "public",
        durationMs: 1000,
        peaks: [0.5, 0.5],
        tags: [],
        genre: "Highlife",
      });
      throw new Error("expected createDraft to fail");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
  });

  it("lists and hides own releases", async () => {
    const t = makeBackend();
    const { userId, artistId } = await seedVerifiedArtist(t);
    const audioFileId = await seedOwnedFile(
      t,
      artistId,
      "trackAudio",
      "audio/mpeg"
    );
    const artworkFileId = await seedOwnedFile(
      t,
      artistId,
      "artwork",
      "image/jpeg"
    );
    const asArtist = asUser(t, userId);
    const trackId = await asArtist.mutation(api.studioTracks.createDraft, {
      title: "Hide me",
      audioFileId,
      artworkFileId,
      visibility: "public",
      durationMs: 1000,
      peaks,
      tags: [],
      genre: "Gospel",
    });
    await asArtist.mutation(api.studioTracks.publishNow, { trackId });
    await asArtist.mutation(api.studioTracks.setHidden, {
      trackId,
      hidden: true,
    });
    const hidden = await asArtist.query(api.studioTracks.listMine, {
      filter: "hidden",
    });
    expect(hidden).toHaveLength(1);
    expect(hidden[0]?.hidden).toBe(true);
  });
});
