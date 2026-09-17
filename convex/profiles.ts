import { v } from "convex/values";

import { authedMutation, authedQuery } from "./lib/functions";

export const me = authedQuery({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("profiles"),
      displayName: v.string(),
    })
  ),
  handler: async (ctx) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.userId))
      .unique();
    if (profile === null) {
      return null;
    }
    return { _id: profile._id, displayName: profile.displayName };
  },
});

export const ensure = authedMutation({
  args: {
    displayName: v.string(),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.userId))
      .unique();
    const displayName = args.displayName.trim();
    if (displayName.length === 0) {
      throw new Error("Display name is required");
    }
    if (existing !== null) {
      await ctx.db.patch(existing._id, { displayName });
      return existing._id;
    }
    return await ctx.db.insert("profiles", {
      userId: ctx.userId,
      displayName,
    });
  },
});
