import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import { asUser, makeBackend } from "./test.setup";

describe("earnings", () => {
  it("writes demo earnings for routed artists and scopes the list to the owner", async () => {
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
      await ctx.db.insert("artists", {
        profileId: kwekuProfile,
        name: "Kweku Darko",
        handle: "kweku-darko",
        bio: "Kumasi",
        verified: true,
        hidden: false,
        createdAt: Date.now(),
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
      await ctx.db.insert("entitlements", {
        profileId: fanProfile,
        status: "active",
        productId: "kindred_supporter_4.99",
        priceTier: "4.99",
        store: "app_store",
        rcAppUserId: String(fanProfile),
        currentPeriodEnd: Date.now() + 30 * 86_400_000,
        willRenew: true,
        lastVerifiedAt: Date.now(),
        updatedAt: Date.now(),
      });
      await ctx.db.insert("supportRoutes", {
        profileId: fanProfile,
        artistId: amaaraId,
        active: true,
        startedAt: Date.now(),
        founding: true,
      });
    });

    await t.mutation(internal.earnings.computeMonth, { period: "2026-09" });

    const amaaraEarnings = await asUser(t, amaaraUser).query(
      api.earnings.listForArtist,
      {}
    );
    const september = amaaraEarnings.months.find(
      (row) => row.period === "2026-09"
    );
    expect(september?.amountCents).toBe(349);
    expect(september?.supporterCount).toBe(1);
    expect(september?.storeFeeCents).toBe(149);

    const kwekuEarnings = await asUser(t, kwekuUser).query(
      api.earnings.listForArtist,
      {}
    );
    expect(
      kwekuEarnings.months.find((row) => row.period === "2026-09")
    ).toBeUndefined();
  });
});
