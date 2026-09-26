import {
  artistShareCents,
  periodKey,
  previousPeriodKey,
  STORE_FEE_RATIO,
  TIER_CENTS,
} from "shared";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { requireVerifiedArtist } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedQuery } from "./lib/functions";

const monthSummaryValidator = v.object({
  period: v.string(),
  amountCents: v.number(),
  storeFeeCents: v.number(),
  supporterCount: v.number(),
});

/**
 * Monthly demo earnings for the signed-in artist's own routes only.
 * Amounts come from demoEarnings rows written by the cron (or seed).
 */
export const listForArtist = authedQuery({
  args: {},
  returns: v.object({
    current: monthSummaryValidator,
    prior: monthSummaryValidator,
    months: v.array(monthSummaryValidator),
  }),
  handler: async (ctx) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const currentPeriod = periodKey();
    const priorPeriod = previousPeriodKey();

    const allRows = await ctx.db
      .query("earningMonths")
      .withIndex("by_artist_period", (q) => q.eq("artistId", artist._id))
      .order("desc")
      .take(24);

    const months = allRows.map((row) => ({
      period: row.period,
      amountCents: row.amountCents,
      storeFeeCents: row.storeFeeCents,
      supporterCount: row.supporterCount,
    }));

    const empty = (period: string) => ({
      period,
      amountCents: 0,
      storeFeeCents: 0,
      supporterCount: 0,
    });

    return {
      current:
        months.find((row) => row.period === currentPeriod) ??
        empty(currentPeriod),
      prior:
        months.find((row) => row.period === priorPeriod) ?? empty(priorPeriod),
      months,
    };
  },
});

async function writePeriodEarnings(
  ctx: MutationCtx,
  period: string,
  cursor: string | null = null
): Promise<{ written: number; skipped: number }> {
  let written = 0;
  let skipped = 0;
  const entitlements = await ctx.db
    .query("entitlements")
    .withIndex("by_status_currentPeriodEnd", (q) => q.eq("status", "active"))
    .paginate({ numItems: 40, cursor });

  for (const entitlement of entitlements.page) {
    const routes = await ctx.db
      .query("supportRoutes")
      .withIndex("by_profile_active", (q) =>
        q.eq("profileId", entitlement.profileId).eq("active", true)
      )
      .take(5);
    if (routes.length === 0) {
      continue;
    }
    const tierCents = TIER_CENTS[entitlement.priceTier];
    const share = artistShareCents(tierCents, routes.length);
    for (const route of routes) {
      const existing = await ctx.db
        .query("demoEarnings")
        .withIndex("by_profile_period", (q) =>
          q.eq("profileId", entitlement.profileId).eq("period", period)
        )
        .take(5);
      if (existing.some((row) => row.artistId === route.artistId)) {
        skipped += 1;
        continue;
      }
      await ctx.db.insert("demoEarnings", {
        period,
        artistId: route.artistId,
        profileId: entitlement.profileId,
        amountCents: share,
        currency: "USD",
        tierCents,
        routedCount: routes.length,
        createdAt: Date.now(),
      });
      await bumpEarningMonth(ctx, {
        artistId: route.artistId,
        period,
        amountCents: share,
        storeFeeCents: Math.floor(tierCents * STORE_FEE_RATIO),
      });
      written += 1;
    }
  }
  if (!entitlements.isDone) {
    await ctx.scheduler.runAfter(0, internal.earnings.continuePeriodEarnings, {
      period,
      cursor: entitlements.continueCursor,
    });
  }
  return { written, skipped };
}

async function bumpEarningMonth(
  ctx: MutationCtx,
  row: {
    artistId: Id<"artists">;
    period: string;
    amountCents: number;
    storeFeeCents: number;
  }
) {
  const existing = await ctx.db
    .query("earningMonths")
    .withIndex("by_artist_period", (q) =>
      q.eq("artistId", row.artistId).eq("period", row.period)
    )
    .unique();
  if (existing === null) {
    await ctx.db.insert("earningMonths", {
      artistId: row.artistId,
      period: row.period,
      amountCents: row.amountCents,
      storeFeeCents: row.storeFeeCents,
      supporterCount: 1,
    });
    return;
  }
  await ctx.db.patch(existing._id, {
    amountCents: existing.amountCents + row.amountCents,
    storeFeeCents: existing.storeFeeCents + row.storeFeeCents,
    supporterCount: existing.supporterCount + 1,
  });
}

/** Writes demo earnings for a period. Idempotent per profile/artist/period. */
export const computeMonth = internalMutation({
  args: { period: v.string() },
  returns: v.object({ written: v.number(), skipped: v.number() }),
  handler: async (ctx, args) => {
    if (!/^\d{4}-\d{2}$/.test(args.period)) {
      raise(ERROR_CODES.INVALID, "Period must look like 2026-09");
    }
    return await writePeriodEarnings(ctx, args.period);
  },
});

/** Next page of active entitlements when one month does not fit in a single write. */
export const continuePeriodEarnings = internalMutation({
  args: { period: v.string(), cursor: v.string() },
  returns: v.object({ written: v.number(), skipped: v.number() }),
  handler: async (ctx, args) => {
    return await writePeriodEarnings(ctx, args.period, args.cursor);
  },
});

/** Cron entry: write the previous UTC month. */
export const computePreviousMonth = internalMutation({
  args: {},
  returns: v.object({
    written: v.number(),
    skipped: v.number(),
    period: v.string(),
  }),
  handler: async (ctx) => {
    const period = previousPeriodKey();
    const result = await writePeriodEarnings(ctx, period);
    return { ...result, period };
  },
});

/** Seed helper: write several past months for the current route set. */
export const seedPastMonths = internalMutation({
  args: { periods: v.array(v.string()) },
  returns: v.object({ written: v.number(), skipped: v.number() }),
  handler: async (ctx, args) => {
    let written = 0;
    let skipped = 0;
    for (const period of args.periods) {
      const result = await writePeriodEarnings(ctx, period);
      written += result.written;
      skipped += result.skipped;
    }
    return { written, skipped };
  },
});

/**
 * One-time fill of monthly totals from existing demoEarnings rows.
 * Pages through the table so a large history does not land in one read.
 */
export const rebuildEarningMonths = internalMutation({
  args: {
    phase: v.union(v.literal("clear"), v.literal("sum")),
    cursor: v.union(v.string(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.phase === "clear") {
      const rows = await ctx.db.query("earningMonths").take(100);
      for (const row of rows) {
        await ctx.db.delete(row._id);
      }
      await ctx.scheduler.runAfter(0, internal.earnings.rebuildEarningMonths, {
        phase: rows.length === 100 ? "clear" : "sum",
        cursor: null,
      });
      return null;
    }

    const page = await ctx.db.query("demoEarnings").paginate({
      numItems: 40,
      cursor: args.cursor,
    });
    for (const row of page.page) {
      await bumpEarningMonth(ctx, {
        artistId: row.artistId,
        period: row.period,
        amountCents: row.amountCents,
        storeFeeCents: Math.floor(row.tierCents * STORE_FEE_RATIO),
      });
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.earnings.rebuildEarningMonths, {
        phase: "sum",
        cursor: page.continueCursor,
      });
    }
    return null;
  },
});
