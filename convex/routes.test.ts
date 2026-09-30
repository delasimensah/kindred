import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function fanWithArtists(t: ReturnType<typeof makeBackend>) {
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "efua.boateng@kindred.example",
      name: "Efua Boateng",
    });
  });
  await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
  const ids = await t.run(async (ctx) => {
    const profile = await ctx.db.query("profiles").first();
    if (profile === null) {
      throw new Error("profile missing");
    }
    const artistA = await ctx.db.insert("artists", {
      name: "Amaara Mensah",
      handle: "amaara-route",
      bio: "Afro-soul",
      verified: true,
      hidden: false,
      createdAt: Date.now(),
    });
    const artistB = await ctx.db.insert("artists", {
      name: "Kweku Darko",
      handle: "kweku-route",
      bio: "Highlife",
      verified: true,
      hidden: false,
      createdAt: Date.now(),
    });
    await ctx.db.insert("artistStats", {
      artistId: artistA,
      followerCount: 1,
      supporterCount: 0,
      followers7d: 0,
      distinctListeners7d: 0,
      plays7d: 0,
      risingScore: 0,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("artistStats", {
      artistId: artistB,
      followerCount: 1,
      supporterCount: 0,
      followers7d: 0,
      distinctListeners7d: 0,
      plays7d: 0,
      risingScore: 0,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("follows", {
      profileId: profile._id,
      artistId: artistA,
      createdAt: Date.now(),
    });
    await ctx.db.insert("follows", {
      profileId: profile._id,
      artistId: artistB,
      createdAt: Date.now(),
    });
    await ctx.db.insert("entitlements", {
      profileId: profile._id,
      status: "active",
      productId: "supporter_monthly_499",
      priceTier: "4.99",
      store: "test_store",
      rcAppUserId: profile._id,
      currentPeriodEnd: Date.now() + 86_400_000,
      willRenew: true,
      lastVerifiedAt: Date.now(),
      updatedAt: Date.now(),
    });
    const storageId = await ctx.storage.store(
      new Blob(["audio"], { type: "audio/mpeg" })
    );
    const audioFileId = await ctx.db.insert("files", {
      storageId,
      kind: "trackAudio",
      artistId: artistB,
      contentType: "audio/mpeg",
      sizeBytes: 5,
      createdAt: Date.now(),
    });
    const exclusiveId = await ctx.db.insert("tracks", {
      artistId: artistB,
      title: "Quiet Room",
      audioFileId,
      visibility: "supporters",
      state: "published",
      publishedAt: Date.now(),
      durationMs: 180000,
      peaks: [0],
      tags: [],
      description: "The exclusive body",
      genre: "Highlife",
      hidden: false,
      createdAt: Date.now(),
    });
    return {
      profileId: profile._id,
      artistA,
      artistB,
      exclusiveId,
    };
  });
  return { t, userId, ...ids };
}

describe("routes", () => {
  it("saves one to five followed artists and keeps the artist who started support", async () => {
    const { t, userId, artistA, artistB } = await fanWithArtists(makeBackend());
    const authed = asUser(t, userId);
    await authed.mutation(api.routes.setRouteSet, {
      artistIds: [artistA],
      startingArtistId: artistA,
    });
    try {
      await authed.mutation(api.routes.setRouteSet, {
        artistIds: [artistB],
        startingArtistId: artistA,
      });
      throw new Error("expected the starting artist to be required");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
    await authed.mutation(api.routes.setRouteSet, {
      artistIds: [artistA, artistB],
      startingArtistId: artistA,
    });
    const summary = await authed.query(api.routes.summary, {});
    expect(summary.entitled).toBe(true);
    expect(summary.routedArtistIds).toHaveLength(2);
  });

  it("lets an Account save remove an artist, and refuses an empty set", async () => {
    const { t, userId, artistA, artistB } = await fanWithArtists(makeBackend());
    const authed = asUser(t, userId);
    await authed.mutation(api.routes.setRouteSet, {
      artistIds: [artistA, artistB],
    });
    await authed.mutation(api.routes.setRouteSet, { artistIds: [artistB] });
    const summary = await authed.query(api.routes.summary, {});
    expect(summary.routedArtistIds).toEqual([artistB]);
    try {
      await authed.mutation(api.routes.setRouteSet, { artistIds: [] });
      throw new Error("expected an empty set to fail");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
  });

  it("clears support when the subscription ends and restores it when they pay again", async () => {
    const { t, userId, profileId, artistA, artistB } =
      await fanWithArtists(makeBackend());
    const authed = asUser(t, userId);
    await authed.mutation(api.routes.setRouteSet, {
      artistIds: [artistA, artistB],
    });
    await authed.mutation(api.routes.setRouteSet, { artistIds: [artistB] });
    await t.run(async (ctx) => {
      const row = await ctx.db.query("entitlements").unique();
      if (row === null) {
        throw new Error("entitlement missing");
      }
      await ctx.db.patch(row._id, { currentPeriodEnd: Date.now() - 1_000 });
    });
    await t.mutation(internal.entitlements.expireDue, {});
    const cleared = await authed.query(api.routes.summary, {});
    expect(cleared).toEqual({ entitled: false, routedArtistIds: [] });
    const paused = await t.run(async (ctx) => {
      return await ctx.db.query("supportRoutes").collect();
    });
    expect(paused.find((route) => route.artistId === artistA)?.active).toBe(
      false
    );
    expect(paused.find((route) => route.artistId === artistA)?.paused).toBe(
      false
    );
    expect(paused.find((route) => route.artistId === artistB)?.paused).toBe(
      true
    );
    const stats = await t.run(async (ctx) => {
      return await ctx.db.query("artistStats").collect();
    });
    expect(stats.find((row) => row.artistId === artistB)?.supporterCount).toBe(
      0
    );

    await t.mutation(internal.entitlements.applyFromSource, {
      profileId,
      status: "active",
      productId: "supporter_monthly_499",
      priceTier: "4.99",
      store: "test_store",
      currentPeriodEnd: Date.now() + 86_400_000,
      willRenew: true,
      eventId: "evt_again",
    });
    const restored = await authed.query(api.routes.summary, {});
    expect(restored.entitled).toBe(true);
    expect(restored.routedArtistIds).toEqual([artistB]);
  });

  it("does not give artist B's exclusive to a supporter routed only to A", async () => {
    const { t, userId, artistA, artistB, exclusiveId } =
      await fanWithArtists(makeBackend());
    const authed = asUser(t, userId);
    await authed.mutation(api.routes.setRouteSet, { artistIds: [artistA] });
    const playback = await authed.query(api.tracks.playbackUrl, {
      trackId: exclusiveId,
    });
    const detail = await authed.query(api.tracks.get, {
      trackId: exclusiveId,
    });
    expect(playback).toBeNull();
    expect(detail?.locked).toBe(true);
    expect(detail?.description).toBeNull();

    await authed.mutation(api.routes.setRouteSet, {
      artistIds: [artistA, artistB],
    });
    const opened = await authed.query(api.tracks.get, { trackId: exclusiveId });
    expect(opened?.locked).toBe(false);
    expect(opened?.description).toBe("The exclusive body");
    const audio = await authed.query(api.tracks.playbackUrl, {
      trackId: exclusiveId,
    });
    expect(audio?.audioUrl).toEqual(expect.any(String));
  });
});
