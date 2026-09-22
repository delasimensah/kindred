import { v } from "convex/values";

import { requireProfile } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { getFollow } from "./lib/follows";
import { authedMutation } from "./lib/functions";

export const add = authedMutation({
  args: { artistId: v.id("artists") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null || artist.hidden) {
      raise(ERROR_CODES.INVALID, "Artist not found");
    }
    const existing = await getFollow(ctx, profile._id, args.artistId);
    if (existing !== null) {
      return null;
    }
    await ctx.db.insert("follows", {
      profileId: profile._id,
      artistId: args.artistId,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const remove = authedMutation({
  args: { artistId: v.id("artists") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const existing = await getFollow(ctx, profile._id, args.artistId);
    if (existing === null) {
      return null;
    }
    await ctx.db.delete(existing._id);
    return null;
  },
});
