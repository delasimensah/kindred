import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { asUser, makeBackend } from "./test.setup";

describe("artists", () => {
  it("lists onboarding artists and a portrait url when attached", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.mutation(internal.seed.onboardingArtists, {});

    const withoutPhotos = await asUser(t, userId).query(
      api.artists.listForOnboarding,
      {}
    );
    expect(withoutPhotos).toHaveLength(5);
    expect(withoutPhotos.every((artist) => artist.avatarUrl === null)).toBe(
      true
    );

    await t.run(async (ctx) => {
      const artist = await ctx.db.query("artists").first();
      if (artist === null) {
        throw new Error("expected a seeded artist");
      }
      const storageId = await ctx.storage.store(
        new Blob(["portrait"], { type: "image/jpeg" })
      );
      const fileId = await ctx.db.insert("files", {
        storageId,
        kind: "avatar",
        artistId: artist._id,
        contentType: "image/jpeg",
        sizeBytes: 8,
        credit: "Photo: Prince Akachi / Unsplash",
        sourceUrl:
          "https://unsplash.com/photos/portrait-photography-of-woman-RcqKOjX0ZHE",
        createdAt: Date.now(),
      });
      await ctx.db.patch(artist._id, { avatarFileId: fileId });
    });

    const withPhotos = await asUser(t, userId).query(
      api.artists.listForOnboarding,
      {}
    );
    expect(withPhotos.some((artist) => artist.avatarUrl !== null)).toBe(true);
  });

  it("returns one artist profile and whether the fan follows them", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.mutation(internal.seed.onboardingArtists, {});
    const artistId = await t.run(async (ctx) => {
      const artist = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", "amaara"))
        .unique();
      if (artist === null) {
        throw new Error("expected Amaara");
      }
      return artist._id;
    });

    const before = await asUser(t, userId).query(api.artists.get, { artistId });
    expect(before?.name).toBe("Amaara Mensah");
    expect(before?.isFollowed).toBe(false);
    expect(before?.liveListenerCount).toBe(0);

    await asUser(t, userId).mutation(api.follows.add, { artistId });
    const after = await asUser(t, userId).query(api.artists.get, { artistId });
    expect(after?.isFollowed).toBe(true);
  });

  it("lists only the signed-in artist's active supporters", async () => {
    const t = makeBackend();
    const amaaraUser = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "amaara@kindred.example",
        name: "Amaara Mensah",
      });
    });
    const amaaraProfile = await asUser(t, amaaraUser).mutation(
      api.profiles.ensureProfile,
      {}
    );
    const kwekuUser = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "kweku@kindred.example",
        name: "Kweku Darko",
      });
    });
    const kwekuProfile = await asUser(t, kwekuUser).mutation(
      api.profiles.ensureProfile,
      {}
    );

    await t.run(async (ctx) => {
      const amaaraId = await ctx.db.insert("artists", {
        profileId: amaaraProfile,
        name: "Amaara Mensah",
        handle: "amaara",
        bio: "Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      const kwekuId = await ctx.db.insert("artists", {
        profileId: kwekuProfile,
        name: "Kweku Darko",
        handle: "kweku-darko",
        bio: "Kumasi",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("artistStats", {
        artistId: amaaraId,
        followerCount: 0,
        supporterCount: 1,
        followers7d: 0,
        distinctListeners7d: 0,
        plays7d: 0,
        risingScore: 0,
        updatedAt: Date.now(),
      });
      await ctx.db.insert("artistStats", {
        artistId: kwekuId,
        followerCount: 0,
        supporterCount: 1,
        followers7d: 0,
        distinctListeners7d: 0,
        plays7d: 0,
        risingScore: 0,
        updatedAt: Date.now(),
      });
      const fanUser = await ctx.db.insert("users", {
        email: "efua@kindred.example",
        name: "Efua Boateng",
      });
      const fanProfile = await ctx.db.insert("profiles", {
        authUserId: fanUser,
        displayName: "Efua Boateng",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("supportRoutes", {
        profileId: fanProfile,
        artistId: amaaraId,
        active: true,
        startedAt: Date.now() - 86_400_000,
        founding: true,
      });
      const otherUser = await ctx.db.insert("users", {
        email: "other@kindred.example",
        name: "Other Fan",
      });
      const otherProfile = await ctx.db.insert("profiles", {
        authUserId: otherUser,
        displayName: "Other Fan",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("supportRoutes", {
        profileId: otherProfile,
        artistId: kwekuId,
        active: true,
        startedAt: Date.now(),
        founding: false,
      });
    });

    const pageOpts = { paginationOpts: { numItems: 30, cursor: null } };
    const amaaraSummary = await asUser(t, amaaraUser).query(
      api.artists.supporterSummary,
      {}
    );
    const amaaraList = await asUser(t, amaaraUser).query(
      api.artists.listSupporters,
      pageOpts
    );
    expect(amaaraSummary.total).toBe(1);
    expect(amaaraSummary.foundingCount).toBe(1);
    expect(amaaraList.page[0]).toMatchObject({
      displayName: "Efua Boateng",
      avatarUrl: null,
    });

    const kwekuSummary = await asUser(t, kwekuUser).query(
      api.artists.supporterSummary,
      {}
    );
    const kwekuList = await asUser(t, kwekuUser).query(
      api.artists.listSupporters,
      pageOpts
    );
    expect(kwekuSummary.total).toBe(1);
    expect(kwekuList.page[0]?.displayName).toBe("Other Fan");
  });
});
