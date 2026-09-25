import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { asUser, errorCode, makeBackend } from "./test.setup";

describe("profiles", () => {
  it("creates a profile on first sign-in and returns it from getMe", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });

    const profileId = await asUser(t, userId).mutation(
      api.profiles.ensureProfile,
      {}
    );
    const again = await asUser(t, userId).mutation(
      api.profiles.ensureProfile,
      {}
    );
    const me = await asUser(t, userId).query(api.profiles.getMe, {});

    expect(again).toBe(profileId);
    expect(me).toMatchObject({
      profileId,
      displayName: "Efua Boateng",
      isAdmin: false,
      canAccessStudio: false,
      artistId: null,
      genres: [],
      followCount: 0,
      hasCompletedOnboarding: false,
      onboardingStep: "genres",
    });
  });

  it("grants studio access when the profile is admin", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "delasi.mensah@kindred.example",
        name: "Delasi Mensah",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.mutation(internal.profiles.grantAdminByEmail, {
      email: "delasi.mensah@kindred.example",
    });

    const me = await asUser(t, userId).query(api.profiles.getMe, {});
    expect(me).toMatchObject({
      isAdmin: true,
      canAccessStudio: true,
      artistId: null,
    });
  });

  it("grants studio access when a verified artist is linked", async () => {
    const t = makeBackend();
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
        bio: "Seed artist",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });

    const me = await asUser(t, userId).query(api.profiles.getMe, {});
    expect(me).toMatchObject({
      isAdmin: false,
      canAccessStudio: true,
      artistId,
    });
  });

  it("grantAdminByEmail reports missing users", async () => {
    const t = makeBackend();
    const result = await t.mutation(internal.profiles.grantAdminByEmail, {
      email: "nobody@kindred.example",
    });
    expect(result).toEqual({
      found: false,
      alreadyAdmin: false,
      profileId: null,
    });
  });

  it("refuses getMe when nobody is signed in", async () => {
    const t = makeBackend();

    try {
      await t.query(api.profiles.getMe, {});
      throw new Error("expected getMe to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("UNAUTHENTICATED");
    }
  });

  it("saves genres, follows two artists, then completes", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.mutation(internal.seed.onboardingArtists, {});

    await asUser(t, userId).mutation(api.profiles.setGenres, {
      genres: ["Highlife", "Afrobeats"],
    });

    const artists = await asUser(t, userId).query(
      api.artists.listForOnboarding,
      {}
    );
    await asUser(t, userId).mutation(api.follows.add, {
      artistId: artists[0].artistId,
    });
    await asUser(t, userId).mutation(api.follows.add, {
      artistId: artists[1].artistId,
    });
    await asUser(t, userId).mutation(api.profiles.completeOnboarding, {});

    const me = await asUser(t, userId).query(api.profiles.getMe, {});
    expect(me).toMatchObject({
      genres: ["Highlife", "Afrobeats"],
      followCount: 2,
      hasCompletedOnboarding: true,
      onboardingStep: "done",
    });
  });

  it("refuses completeOnboarding before two follows", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.mutation(internal.seed.onboardingArtists, {});
    await asUser(t, userId).mutation(api.profiles.setGenres, {
      genres: ["Gospel"],
    });

    try {
      await asUser(t, userId).mutation(api.profiles.completeOnboarding, {});
      throw new Error("expected completeOnboarding to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("INVALID");
    }
  });
});
