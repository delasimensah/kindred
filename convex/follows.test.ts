import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import { asUser, errorCode, makeBackend } from "./test.setup";

describe("follows", () => {
  it("refuses to unfollow an artist who is in the support route", async () => {
    const t = makeBackend();
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "efua.boateng@kindredmail.com",
        name: "Efua Boateng",
      });
    });
    await asUser(t, userId).mutation(api.profiles.ensureProfile, {});
    const artistId = await t.run(async (ctx) => {
      const profile = await ctx.db.query("profiles").first();
      if (profile === null) {
        throw new Error("profile missing");
      }
      const artistId = await ctx.db.insert("artists", {
        name: "Amaara Mensah",
        handle: "amaara-route",
        bio: "Afro-soul and R&B · Accra",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("follows", {
        profileId: profile._id,
        artistId,
        createdAt: Date.now(),
      });
      await ctx.db.insert("supportRoutes", {
        profileId: profile._id,
        artistId,
        active: true,
        startedAt: Date.now(),
        founding: false,
      });
      return artistId;
    });

    try {
      await asUser(t, userId).mutation(api.follows.remove, { artistId });
      throw new Error("expected unfollow to refuse");
    } catch (error) {
      expect(errorCode(error)).toBe("NOT_PERMITTED");
    }

    const stillFollowed = await t.run(async (ctx) => {
      return await ctx.db.query("follows").collect();
    });
    expect(stillFollowed).toHaveLength(1);

    const mine = await asUser(t, userId).query(api.follows.listMine, {});
    expect(mine).toEqual([
      expect.objectContaining({
        artistId,
        name: "Amaara Mensah",
        supporting: true,
      }),
    ]);
  });
});
