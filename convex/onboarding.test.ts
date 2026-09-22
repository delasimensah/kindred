import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { asUser, errorCode, makeBackend } from "./test.setup";

async function insertFan(t: ReturnType<typeof makeBackend>) {
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
  return { userId, profileId };
}

describe("onboarding", () => {
  it("saves genres, follows two artists, then completes", async () => {
    const t = makeBackend();
    const { userId } = await insertFan(t);
    await t.mutation(internal.seed.onboardingArtists, {});

    await asUser(t, userId).mutation(api.profiles.setGenres, {
      genres: ["Highlife", "Afrobeats"],
    });

    const artists = await asUser(t, userId).query(
      api.artists.listForOnboarding,
      {}
    );
    expect(artists.length).toBe(5);
    expect(artists.every((artist) => artist.avatarUrl === null)).toBe(true);

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
    const { userId } = await insertFan(t);
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

  it("returns a portrait url after an avatar is attached", async () => {
    const t = makeBackend();
    const { userId } = await insertFan(t);
    await t.mutation(internal.seed.onboardingArtists, {});
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

    const artists = await asUser(t, userId).query(
      api.artists.listForOnboarding,
      {}
    );
    expect(artists.some((artist) => artist.avatarUrl !== null)).toBe(true);
  });
});
