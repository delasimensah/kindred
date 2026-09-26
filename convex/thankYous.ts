import { THANK_YOU_SHORTLIST } from "shared";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { requireProfile, requireVerifiedArtist } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedMutation, authedQuery } from "./lib/functions";

const BODY_MAX = 500;

const thankYouValidator = v.object({
  thankYouId: v.id("thankYous"),
  artistId: v.id("artists"),
  artistName: v.string(),
  body: v.string(),
  sentAt: v.number(),
  readAt: v.union(v.number(), v.null()),
});

/**
 * Artist sends an edited one-liner to a fan who routes to them.
 * Push delivery lands when the push outbox exists.
 */
export const send = authedMutation({
  args: {
    profileId: v.id("profiles"),
    body: v.string(),
  },
  returns: v.id("thankYous"),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const body = args.body.trim();
    if (body.length === 0 || body.length > BODY_MAX) {
      raise(ERROR_CODES.INVALID, "Thank-you must be 1–500 characters");
    }
    const fan = await ctx.db.get(args.profileId);
    if (fan === null) {
      raise(ERROR_CODES.INVALID, "Fan not found");
    }
    const route = await ctx.db
      .query("supportRoutes")
      .withIndex("by_profile_artist", (q) =>
        q.eq("profileId", args.profileId).eq("artistId", artist._id)
      )
      .unique();
    if (route === null || !route.active) {
      raise(ERROR_CODES.NOT_PERMITTED, "Fan is not routing to you");
    }
    if (route.thanked === true) {
      raise(ERROR_CODES.INVALID, "You already thanked this supporter");
    }
    const sentAt = Date.now();
    const thankYouId = await ctx.db.insert("thankYous", {
      artistId: artist._id,
      profileId: args.profileId,
      body,
      sentAt,
    });
    await ctx.db.patch(route._id, { thanked: true });
    return thankYouId;
  },
});

/**
 * Earlier builds scheduled a return to the list after 30 days.
 * A thank-you is once, so that scheduled call does nothing.
 */
export const releaseThankYouCooldown = internalMutation({
  args: { routeId: v.id("supportRoutes") },
  returns: v.null(),
  handler: async () => {
    return null;
  },
});

/** Fan inbox: thank-yous addressed to the signed-in profile. */
export const listMine = authedQuery({
  args: {},
  returns: v.array(thankYouValidator),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const rows = await ctx.db
      .query("thankYous")
      .withIndex("by_profile_sentAt", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .take(50);
    const result = [];
    for (const row of rows) {
      const artist = await ctx.db.get(row.artistId);
      if (artist === null) {
        continue;
      }
      result.push({
        thankYouId: row._id,
        artistId: artist._id,
        artistName: artist.name,
        body: row.body,
        sentAt: row.sentAt,
        readAt: row.readAt ?? null,
      });
    }
    return result;
  },
});

export const markRead = authedMutation({
  args: { thankYouId: v.id("thankYous") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const row = await ctx.db.get(args.thankYouId);
    if (row === null || row.profileId !== profile._id) {
      raise(ERROR_CODES.NOT_PERMITTED);
    }
    if (row.readAt === undefined) {
      await ctx.db.patch(row._id, { readAt: Date.now() });
    }
    return null;
  },
});

const MS_30D = 30 * 24 * 60 * 60 * 1000;

export function draftThankYouLine(args: {
  displayName: string;
  startedAt: number;
  founding: boolean;
}): string {
  const firstName = args.displayName.trim().split(/\s+/)[0] ?? "friend";
  const sinceLabel = new Date(args.startedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (args.founding) {
    return `${firstName}, you've been here since ${sinceLabel} — a founding supporter. This one's for you.`;
  }
  return `${firstName}, thank you for routing support my way since ${sinceLabel}. Grateful you're here.`;
}

/**
 * Ranked shortlist for the fans-to-thank screen.
 * Ranking is founding supporters first, then earliest route, then listening.
 * Anyone already thanked is left off, so the next supporter moves up.
 * Also exposed as ai.rankFansToThank for the product API name.
 */
export const rankCandidates = authedQuery({
  args: {},
  returns: v.array(
    v.object({
      profileId: v.id("profiles"),
      displayName: v.string(),
      avatarUrl: v.union(v.string(), v.null()),
      startedAt: v.number(),
      founding: v.boolean(),
      listenMs30d: v.number(),
      draft: v.string(),
    })
  ),
  handler: async (ctx) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const founding = await queueSlice(
      ctx,
      artist._id,
      true,
      THANK_YOU_SHORTLIST
    );
    const rest = await queueSlice(
      ctx,
      artist._id,
      false,
      THANK_YOU_SHORTLIST - founding.length
    );
    const chosen = [...founding, ...rest];

    const tiedStarts = new Set<number>();
    const seenStarts = new Set<number>();
    for (const route of chosen) {
      if (seenStarts.has(route.startedAt)) {
        tiedStarts.add(route.startedAt);
      }
      seenStarts.add(route.startedAt);
    }
    const since = Date.now() - MS_30D;
    const listenByProfile = new Map<string, number>();
    for (const route of chosen) {
      if (!tiedStarts.has(route.startedAt)) {
        continue;
      }
      listenByProfile.set(
        route.profileId,
        await listenMsForProfile(ctx, route.profileId, artist._id, since)
      );
    }

    const scored = [];
    for (const route of chosen) {
      const fan = await ctx.db.get(route.profileId);
      if (fan === null) {
        continue;
      }
      scored.push({
        profileId: fan._id,
        displayName: fan.displayName,
        avatarUrl: null,
        startedAt: route.startedAt,
        founding: route.founding,
        listenMs30d: listenByProfile.get(route.profileId) ?? 0,
        draft: draftThankYouLine({
          displayName: fan.displayName,
          startedAt: route.startedAt,
          founding: route.founding,
        }),
      });
    }

    scored.sort((left, right) => {
      if (left.founding !== right.founding) {
        return left.founding ? -1 : 1;
      }
      if (left.startedAt !== right.startedAt) {
        return left.startedAt - right.startedAt;
      }
      if (left.listenMs30d !== right.listenMs30d) {
        return right.listenMs30d - left.listenMs30d;
      }
      return left.displayName.localeCompare(right.displayName);
    });

    return scored;
  },
});

async function queueSlice(
  ctx: QueryCtx,
  artistId: Id<"artists">,
  founding: boolean,
  limit: number
) {
  if (limit <= 0) {
    return [];
  }
  return await ctx.db
    .query("supportRoutes")
    .withIndex("by_artist_thank_queue", (q) =>
      q
        .eq("artistId", artistId)
        .eq("active", true)
        .eq("thanked", false)
        .eq("founding", founding)
    )
    .take(limit);
}

async function listenMsForProfile(
  ctx: QueryCtx,
  profileId: Id<"profiles">,
  artistId: Id<"artists">,
  since: number
) {
  const events = await ctx.db
    .query("listenEvents")
    .withIndex("by_profile_startedAt", (q) =>
      q.eq("profileId", profileId).gte("startedAt", since)
    )
    .take(100);
  let total = 0;
  for (const event of events) {
    if (event.artistId === artistId) {
      total += event.msPlayed;
    }
  }
  return total;
}

/** Sets `thanked` from thank-yous already sent, and clears the old 30-day fields. */
export const backfillThanked = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const page = await ctx.db.query("supportRoutes").paginate({
      numItems: 40,
      cursor: args.cursor,
    });
    for (const route of page.page) {
      if (route.thanked !== undefined) {
        continue;
      }
      const sent = await ctx.db
        .query("thankYous")
        .withIndex("by_profile_sentAt", (q) =>
          q.eq("profileId", route.profileId)
        )
        .take(20);
      await ctx.db.patch(route._id, {
        thanked: sent.some((row) => row.artistId === route.artistId),
      });
    }
    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.thankYous.backfillThanked, {
        cursor: page.continueCursor,
      });
    }
    return null;
  },
});
