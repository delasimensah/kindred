import { v } from "convex/values";

import { getProfileByAuthUserId, requireProfile } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { countFollowsForProfile } from "./lib/follows";
import { authedMutation, authedQuery } from "./lib/functions";
import {
  hasUnknownGenre,
  ONBOARDING_MIN_FOLLOWS,
  ONBOARDING_MIN_GENRES,
} from "./lib/genres";
import { displayNameForNewProfile } from "./lib/profileName";

const onboardingStepValidator = v.union(
  v.literal("genres"),
  v.literal("follows"),
  v.literal("done")
);

const meValidator = v.object({
  profileId: v.id("profiles"),
  displayName: v.string(),
  isAdmin: v.boolean(),
  genres: v.array(v.string()),
  followCount: v.number(),
  hasCompletedOnboarding: v.boolean(),
  onboardingStep: onboardingStepValidator,
  timezone: v.union(v.string(), v.null()),
  createdAt: v.number(),
});

function onboardingStep(args: {
  hasCompletedOnboarding: boolean;
  genreCount: number;
}): "genres" | "follows" | "done" {
  if (args.hasCompletedOnboarding) {
    return "done";
  }
  if (args.genreCount < ONBOARDING_MIN_GENRES) {
    return "genres";
  }
  return "follows";
}

export const getMe = authedQuery({
  args: {},
  returns: v.union(v.null(), meValidator),
  handler: async (ctx) => {
    const profile = await getProfileByAuthUserId(ctx, ctx.userId);
    if (profile === null) {
      return null;
    }
    const followCount = await countFollowsForProfile(ctx, profile._id);
    const hasCompletedOnboarding = profile.onboardingCompletedAt !== undefined;
    return {
      profileId: profile._id,
      displayName: profile.displayName,
      isAdmin: profile.isAdmin,
      genres: profile.genres,
      followCount,
      hasCompletedOnboarding,
      onboardingStep: onboardingStep({
        hasCompletedOnboarding,
        genreCount: profile.genres.length,
      }),
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

export const setGenres = authedMutation({
  args: { genres: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    if (hasUnknownGenre(args.genres)) {
      raise(ERROR_CODES.INVALID, "Unknown genre");
    }
    const unique = [...new Set(args.genres)];
    await ctx.db.patch(profile._id, { genres: unique });
    return null;
  },
});

export const completeOnboarding = authedMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    if (profile.onboardingCompletedAt !== undefined) {
      return null;
    }
    if (profile.genres.length < ONBOARDING_MIN_GENRES) {
      raise(ERROR_CODES.INVALID, "Pick at least one genre");
    }
    const followCount = await countFollowsForProfile(ctx, profile._id);
    if (followCount < ONBOARDING_MIN_FOLLOWS) {
      raise(ERROR_CODES.INVALID, "Follow at least two artists");
    }
    await ctx.db.patch(profile._id, { onboardingCompletedAt: Date.now() });
    return null;
  },
});
