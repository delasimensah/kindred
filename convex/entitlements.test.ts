import { describe, expect, it } from "vitest";

import { internal } from "./_generated/api";
import { makeBackend } from "./test.setup";

describe("entitlements", () => {
  it("writes an active row from a webhook and ignores the same event twice", async () => {
    const t = makeBackend();
    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "fan@kindred.example",
        name: "Efua Boateng",
      });
      return await ctx.db.insert("profiles", {
        authUserId: userId,
        displayName: "Efua Boateng",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
    });

    const body = {
      event: {
        id: "evt_buy",
        type: "INITIAL_PURCHASE",
        app_user_id: profileId,
        product_id: "supporter_monthly_499",
        expiration_at_ms: Date.now() + 86_400_000,
        store: "TEST_STORE",
      },
    };
    await t.mutation(internal.entitlements.applyWebhook, { body });
    await t.mutation(internal.entitlements.applyWebhook, { body });

    const rows = await t.run(async (ctx) => {
      return await ctx.db.query("entitlements").collect();
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      status: "active",
      priceTier: "4.99",
      store: "test_store",
    });
    const events = await t.run(async (ctx) => {
      return await ctx.db.query("rcWebhookEvents").collect();
    });
    expect(events).toHaveLength(1);
  });

  it("does not move the period end backwards and expires a lapsed row", async () => {
    const t = makeBackend();
    const later = Date.now() + 10 * 86_400_000;
    const profileId = await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "fan2@kindred.example",
        name: "Akosua Frimpong",
      });
      const id = await ctx.db.insert("profiles", {
        authUserId: userId,
        displayName: "Akosua Frimpong",
        genres: [],
        isAdmin: false,
        createdAt: Date.now(),
      });
      await ctx.db.insert("entitlements", {
        profileId: id,
        status: "active",
        productId: "supporter_monthly_999",
        priceTier: "9.99",
        store: "test_store",
        rcAppUserId: String(id),
        currentPeriodEnd: later,
        willRenew: true,
        lastVerifiedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return id;
    });

    await t.mutation(internal.entitlements.applyFromSource, {
      profileId,
      status: "active",
      productId: "supporter_monthly_499",
      priceTier: "4.99",
      store: "test_store",
      currentPeriodEnd: later - 86_400_000,
      willRenew: true,
      eventId: "evt_late",
    });
    const kept = await t.run(async (ctx) => {
      return await ctx.db.query("entitlements").unique();
    });
    expect(kept?.currentPeriodEnd).toBe(later);

    await t.mutation(internal.entitlements.applyFromSource, {
      profileId,
      status: "expired",
      productId: "supporter_monthly_999",
      priceTier: "9.99",
      store: "test_store",
      currentPeriodEnd: Date.now() - 1_000,
      willRenew: false,
      eventId: "evt_end",
    });
    const expired = await t.run(async (ctx) => {
      return await ctx.db.query("entitlements").unique();
    });
    expect(expired?.status).toBe("expired");
  });
});
