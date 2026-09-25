import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireProfile } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedMutation, authedQuery } from "./lib/functions";
import {
  EMPTY_REACTION_COUNTS,
  isReactionEmoji,
  reactionCountKey,
} from "./lib/reactions";

const countsValidator = v.object({
  fire: v.number(),
  heart: v.number(),
  praise: v.number(),
  clap: v.number(),
  sparkle: v.number(),
});

async function patchCounts(
  ctx: MutationCtx,
  trackId: Id<"tracks">,
  previous: string | null,
  next: string
) {
  if (previous === next || !isReactionEmoji(next)) {
    return;
  }
  const row = await ctx.db
    .query("trackReactionCounts")
    .withIndex("by_trackId", (q) => q.eq("trackId", trackId))
    .unique();
  const counts = { ...(row?.counts ?? EMPTY_REACTION_COUNTS) };
  if (previous !== null && isReactionEmoji(previous)) {
    const previousKey = reactionCountKey(previous);
    counts[previousKey] = Math.max(0, counts[previousKey] - 1);
  }
  const nextKey = reactionCountKey(next);
  counts[nextKey] = counts[nextKey] + 1;
  if (row === null) {
    await ctx.db.insert("trackReactionCounts", {
      trackId,
      counts,
      updatedAt: Date.now(),
    });
    return;
  }
  await ctx.db.patch(row._id, { counts, updatedAt: Date.now() });
}

export const set = authedMutation({
  args: {
    trackId: v.id("tracks"),
    emoji: v.string(),
    clientEventId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    if (!isReactionEmoji(args.emoji)) {
      raise(ERROR_CODES.INVALID, "Unknown reaction");
    }
    const track = await ctx.db.get(args.trackId);
    if (track === null || track.hidden || track.state !== "published") {
      raise(ERROR_CODES.INVALID, "Track not found");
    }
    if (args.clientEventId !== undefined) {
      const prior = await ctx.db
        .query("reactions")
        .withIndex("by_profile_clientEventId", (q) =>
          q.eq("profileId", profile._id).eq("clientEventId", args.clientEventId)
        )
        .unique();
      if (prior !== null) {
        return null;
      }
    }
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_profile_track", (q) =>
        q.eq("profileId", profile._id).eq("trackId", args.trackId)
      )
      .unique();
    const now = Date.now();
    if (existing === null) {
      await ctx.db.insert("reactions", {
        profileId: profile._id,
        trackId: args.trackId,
        emoji: args.emoji,
        createdAt: now,
        ...(args.clientEventId === undefined
          ? {}
          : { clientEventId: args.clientEventId }),
      });
    } else {
      await ctx.db.patch(existing._id, {
        emoji: args.emoji,
        createdAt: now,
        ...(args.clientEventId === undefined
          ? {}
          : { clientEventId: args.clientEventId }),
      });
    }
    await patchCounts(ctx, args.trackId, existing?.emoji ?? null, args.emoji);
    return null;
  },
});

export const listForTrack = authedQuery({
  args: { trackId: v.id("tracks") },
  returns: v.object({
    mine: v.union(v.string(), v.null()),
    counts: countsValidator,
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const mine = await ctx.db
      .query("reactions")
      .withIndex("by_profile_track", (q) =>
        q.eq("profileId", profile._id).eq("trackId", args.trackId)
      )
      .unique();
    const counts = await ctx.db
      .query("trackReactionCounts")
      .withIndex("by_trackId", (q) => q.eq("trackId", args.trackId))
      .unique();
    return {
      mine: mine?.emoji ?? null,
      counts: counts?.counts ?? EMPTY_REACTION_COUNTS,
    };
  },
});
