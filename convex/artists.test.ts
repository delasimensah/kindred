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

    await asUser(t, userId).mutation(api.follows.add, { artistId });
    const after = await asUser(t, userId).query(api.artists.get, { artistId });
    expect(after?.isFollowed).toBe(true);
  });
});
