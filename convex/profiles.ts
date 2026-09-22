import { v } from "convex/values";

import { getProfileByAuthUserId } from "./lib/auth";
import { authedMutation, authedQuery } from "./lib/functions";
import { displayNameForNewProfile } from "./lib/profileName";

const meValidator = v.object({
  profileId: v.id("profiles"),
  displayName: v.string(),
  isAdmin: v.boolean(),
  genres: v.array(v.string()),
  timezone: v.union(v.string(), v.null()),
  createdAt: v.number(),
});

export const getMe = authedQuery({
  args: {},
  returns: v.union(v.null(), meValidator),
  handler: async (ctx) => {
    const profile = await getProfileByAuthUserId(ctx, ctx.userId);
    if (profile === null) {
      return null;
    }
    return {
      profileId: profile._id,
      displayName: profile.displayName,
      isAdmin: profile.isAdmin,
      genres: profile.genres,
      timezone: profile.timezone ?? null,
      createdAt: profile.createdAt,
    };
  },
});

export const ensureProfile = authedMutation({
  args: {},
  returns: v.id("profiles"),
  handler: async (ctx) => {
    const existing = await getProfileByAuthUserId(ctx, ctx.userId);
    if (existing !== null) {
      return existing._id;
    }

    const user = await ctx.db.get(ctx.userId);
    const displayName = displayNameForNewProfile({
      name: user?.name,
      email: user?.email,
    });

    return await ctx.db.insert("profiles", {
      authUserId: ctx.userId,
      displayName,
      genres: [],
      isAdmin: false,
      createdAt: Date.now(),
    });
  },
});
