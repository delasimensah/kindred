import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { getProfileByAuthUserId } from "./lib/auth";
import {
  pauseSupportForProfile,
  resumePausedSupport,
} from "./lib/supporterAccess";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedQuery } from "./lib/functions";
import {
  entitlementFromSubscriber,
  entitlementFromWebhook,
  type EntitlementStore,
  type PriceTier,
} from "./lib/revenueCatEvent";

const priceTier = v.union(v.literal("4.99"), v.literal("9.99"));
const store = v.union(
  v.literal("app_store"),
  v.literal("play_store"),
  v.literal("test_store")
);

const sourceArgs = {
  profileId: v.id("profiles"),
  status: v.union(v.literal("active"), v.literal("expired")),
  productId: v.string(),
  priceTier,
  store,
  currentPeriodEnd: v.number(),
  willRenew: v.boolean(),
  eventId: v.string(),
};

async function writeEntitlement(
  ctx: MutationCtx,
  args: {
    profileId: Id<"profiles">;
    status: "active" | "expired";
    productId: string;
    priceTier: PriceTier;
    store: EntitlementStore;
    currentPeriodEnd: number;
    willRenew: boolean;
    eventId: string;
  }
) {
  const existing = await ctx.db
    .query("entitlements")
    .withIndex("by_profileId", (q) => q.eq("profileId", args.profileId))
    .unique();
  const now = Date.now();
  // An older period ending must not cancel a newer one that is still open.
  if (
    existing !== null &&
    args.status === "expired" &&
    existing.currentPeriodEnd > now &&
    args.currentPeriodEnd < existing.currentPeriodEnd
  ) {
    return;
  }
  const periodEnd =
    existing !== null &&
    args.status === "active" &&
    args.currentPeriodEnd < existing.currentPeriodEnd
      ? existing.currentPeriodEnd
      : args.currentPeriodEnd;
  const patch = {
    status: args.status,
    productId: args.productId,
    priceTier: args.priceTier,
    store: args.store,
    rcAppUserId: String(args.profileId),
    currentPeriodEnd: periodEnd,
    willRenew: args.willRenew,
    lastVerifiedAt: now,
    lastEventId: args.eventId,
    updatedAt: now,
  };
  if (existing === null) {
    await ctx.db.insert("entitlements", {
      profileId: args.profileId,
      ...patch,
    });
  } else {
    await ctx.db.patch(existing._id, patch);
  }
  if (patch.status === "active" && periodEnd > now) {
    await resumePausedSupport(ctx, args.profileId);
    return;
  }
  await pauseSupportForProfile(ctx, args.profileId);
}

/** The only write of a Supporter row. Webhooks and the server sync both call this. */
export const applyFromSource = internalMutation({
  args: sourceArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await writeEntitlement(ctx, args);
    return null;
  },
});

export const applyWebhook = internalMutation({
  args: { body: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const parsed = entitlementFromWebhook(args.body);
    if (parsed === null) {
      return null;
    }
    const already = await ctx.db
      .query("rcWebhookEvents")
      .withIndex("by_eventId", (q) => q.eq("eventId", parsed.eventId))
      .unique();
    if (already !== null) {
      return null;
    }
    if (!("ignore" in parsed)) {
      const profileId = ctx.db.normalizeId("profiles", parsed.profileId);
      if (profileId !== null) {
        const profile = await ctx.db.get(profileId);
        if (profile !== null) {
          await writeEntitlement(ctx, { ...parsed, profileId });
        }
      }
    }
    await ctx.db.insert("rcWebhookEvents", {
      eventId: parsed.eventId,
      eventType: "ignore" in parsed ? parsed.eventType : parsed.status,
      appliedAt: Date.now(),
    });
    return null;
  },
});

/** Backup for a missed expiration webhook. */
export const expireDue = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("entitlements")
      .withIndex("by_status_currentPeriodEnd", (q) =>
        q.eq("status", "active").lt("currentPeriodEnd", now)
      )
      .take(50);
    for (const row of due) {
      await ctx.db.patch(row._id, {
        status: "expired",
        willRenew: false,
        updatedAt: now,
      });
      await pauseSupportForProfile(ctx, row.profileId);
    }
    const alreadyExpired = await ctx.db
      .query("entitlements")
      .withIndex("by_status_currentPeriodEnd", (q) => q.eq("status", "expired"))
      .take(50);
    for (const row of alreadyExpired) {
      await pauseSupportForProfile(ctx, row.profileId);
    }
    return null;
  },
});

export const getMine = authedQuery({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      status: v.union(v.literal("active"), v.literal("expired")),
      priceTier,
      productId: v.string(),
    })
  ),
  handler: async (ctx) => {
    const profile = await getProfileByAuthUserId(ctx, ctx.userId);
    if (profile === null) {
      return null;
    }
    const row = await ctx.db
      .query("entitlements")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile._id))
      .unique();
    if (row === null) {
      return null;
    }
    const paying = row.status === "active" && row.currentPeriodEnd > Date.now();
    const status = paying ? ("active" as const) : ("expired" as const);
    return {
      status,
      priceTier: row.priceTier,
      productId: row.productId,
    };
  },
});

export const profileIdForUser = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(v.id("profiles"), v.null()),
  handler: async (ctx, args) => {
    const profile = await getProfileByAuthUserId(ctx, args.userId);
    return profile?._id ?? null;
  },
});

const SYNC_ATTEMPTS = 4;
const SYNC_WAIT_MS = 700;

function periodIsOpen(
  applied: { status: "active" | "expired"; currentPeriodEnd: number },
  now: number
): boolean {
  return applied.status === "active" && applied.currentPeriodEnd > now;
}

export const syncFromRevenueCat = internalAction({
  args: { userId: v.id("users") },
  returns: v.object({ entitled: v.boolean() }),
  handler: async (ctx, args): Promise<{ entitled: boolean }> => {
    const secret = process.env.REVENUECAT_SECRET_KEY;
    if (secret === undefined || secret.length === 0) {
      raise(ERROR_CODES.INVALID, "RevenueCat server key is not set");
    }
    const profileId = await ctx.runQuery(
      internal.entitlements.profileIdForUser,
      { userId: args.userId }
    );
    if (profileId === null) {
      raise(ERROR_CODES.INVALID, "Profile is missing");
    }
    let applied = entitlementFromSubscriber(profileId, null, Date.now());
    for (let attempt = 0; attempt < SYNC_ATTEMPTS; attempt += 1) {
      const now = Date.now();
      const response = await fetch(
        `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(profileId)}`,
        { headers: { Authorization: `Bearer ${secret}` } }
      );
      if (!response.ok) {
        raise(ERROR_CODES.INVALID, "RevenueCat did not return this subscriber");
      }
      const payload: unknown = await response.json();
      applied = entitlementFromSubscriber(profileId, payload, now);
      if (!("none" in applied) && periodIsOpen(applied, now)) {
        break;
      }
      if (attempt < SYNC_ATTEMPTS - 1) {
        await new Promise((resolve) => {
          setTimeout(resolve, SYNC_WAIT_MS);
        });
      }
    }
    if ("none" in applied) {
      return { entitled: false };
    }
    const entitled = periodIsOpen(applied, Date.now());
    await ctx.runMutation(internal.entitlements.applyFromSource, {
      ...applied,
      profileId,
    });
    return { entitled };
  },
});

/** Phone calls this after a purchase, after restore, and on a signed-in launch. */
export const sync = action({
  args: {},
  returns: v.object({ entitled: v.boolean() }),
  handler: async (ctx): Promise<{ entitled: boolean }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      raise(ERROR_CODES.UNAUTHENTICATED);
    }
    return await ctx.runAction(internal.entitlements.syncFromRevenueCat, {
      userId: userId as Id<"users">,
    });
  },
});
