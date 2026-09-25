import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { asUser, errorCode, makeBackend } from "./test.setup";

describe("studio", () => {
  it("returns null home when the viewer has no artist", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "admin@kindred.example",
        name: "Admin",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    await t.run(async (ctx) => {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_authUserId", (q) => q.eq("authUserId", userId))
        .unique();
      if (profile !== null) {
        await ctx.db.patch(profile._id, { isAdmin: true });
      }
    });

    const home = await asUser(t, userId).query(api.studio.getHome, {});
    expect(home).toBeNull();
  });

  it("returns studio home metrics and releases for a verified artist", async () => {
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
      const id = await ctx.db.insert("artists", {
        profileId,
        name: "Amaara Mensah",
        handle: "amaara",
        bio: "Highlife from Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("artistStats", {
        artistId: id,
        followerCount: 10,
        supporterCount: 42,
        followers7d: 0,
        distinctListeners7d: 0,
        plays7d: 0,
        risingScore: 0,
        updatedAt: Date.now(),
      });
      const audio = await ctx.storage.store(new Blob(["audio"]));
      const audioFileId = await ctx.db.insert("files", {
        storageId: audio,
        kind: "trackAudio",
        artistId: id,
        contentType: "audio/mpeg",
        sizeBytes: 5,
        createdAt: Date.now(),
      });
      await ctx.db.insert("tracks", {
        artistId: id,
        title: "Osu Nights",
        audioFileId,
        visibility: "public",
        state: "published",
        publishedAt: Date.now(),
        durationMs: 120000,
        peaks: Array.from({ length: 1000 }, () => 0.5),
        tags: [],
        genre: "Highlife",
        hidden: false,
        createdAt: Date.now(),
      });
      return id;
    });

    const home = await asUser(t, userId).query(api.studio.getHome, {});
    expect(home).toMatchObject({
      artistId,
      artistName: "Amaara Mensah",
      supporterCount: 42,
      scheduledCount: 0,
      thankYouCount: 0,
    });
    expect(home?.recentReleases[0]?.title).toBe("Osu Nights");
  });

  it("updates artist name and bio", async () => {
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
    await t.run(async (ctx) => {
      await ctx.db.insert("artists", {
        profileId,
        name: "Amaara Mensah",
        handle: "amaara",
        bio: "Old bio",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
    });

    await asUser(t, userId).mutation(api.studio.updateMyProfile, {
      name: "Amaara M.",
      bio: "New bio from Accra",
    });
    const profile = await asUser(t, userId).query(api.studio.getMyProfile, {});
    expect(profile).toMatchObject({
      name: "Amaara M.",
      bio: "New bio from Accra",
    });
  });

  it("refuses profile edits for fans", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "fan@kindred.example",
        name: "Fan",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});

    try {
      await asUser(t, userId).mutation(api.studio.updateMyProfile, {
        name: "Nope",
        bio: "Nope",
      });
      throw new Error("expected refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }
  });
});
