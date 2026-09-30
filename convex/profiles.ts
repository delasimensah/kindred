import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";
import {
  canAccessStudio,
  getProfileByAuthUserId,
  getVerifiedArtistForProfile,
  requireProfile,
} from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
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

const PROFILE_NAME_MAX = 80;
const PROFILE_PHOTO_MAX_BYTES = 10 * 1024 * 1024;

const meValidator = v.object({
  profileId: v.id("profiles"),
  displayName: v.string(),
  email: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  isAdmin: v.boolean(),
  canAccessStudio: v.boolean(),
  artistId: v.union(v.id("artists"), v.null()),
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
    const verifiedArtist = await getVerifiedArtistForProfile(ctx, profile._id);
    const user = await ctx.db.get(ctx.userId);
    return {
      profileId: profile._id,
      displayName: profile.displayName,
      email: user?.email ?? "",
      avatarUrl: await fileUrl(ctx, profile.avatarFileId),
      isAdmin: profile.isAdmin,
      canAccessStudio: canAccessStudio({
        isAdmin: profile.isAdmin,
        verifiedArtist,
      }),
      artistId: verifiedArtist?._id ?? null,
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

/**
 * One-off: grant admin (Studio + admin web access) to an existing auth user.
 * Run from the repo: `npx convex run profiles:grantAdminByEmail '{"email":"..."}'`
 * after the function is pushed. Does not create a password account.
 */
export const grantAdminByEmail = internalMutation({
  args: { email: v.string() },
  returns: v.object({
    found: v.boolean(),
    alreadyAdmin: v.boolean(),
    profileId: v.union(v.id("profiles"), v.null()),
  }),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    let user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    if (user === null) {
      const users = await ctx.db.query("users").collect();
      user =
        users.find(
          (row) =>
            typeof row.email === "string" &&
            row.email.trim().toLowerCase() === email
        ) ?? null;
    }
    if (user === null) {
      return { found: false, alreadyAdmin: false, profileId: null };
    }

    const existing = await getProfileByAuthUserId(ctx, user._id);
    if (existing !== null) {
      if (existing.isAdmin) {
        return {
          found: true,
          alreadyAdmin: true,
          profileId: existing._id,
        };
      }
      await ctx.db.patch(existing._id, { isAdmin: true });
      return {
        found: true,
        alreadyAdmin: false,
        profileId: existing._id,
      };
    }

    const profileId = await ctx.db.insert("profiles", {
      authUserId: user._id,
      displayName: displayNameForNewProfile({
        name: user.name,
        email: user.email,
      }),
      genres: [],
      isAdmin: true,
      createdAt: Date.now(),
    });
    return { found: true, alreadyAdmin: false, profileId };
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

export const setDisplayName = authedMutation({
  args: { displayName: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const displayName = args.displayName.trim();
    if (displayName.length === 0) {
      raise(ERROR_CODES.INVALID, "Enter your name");
    }
    if (displayName.length > PROFILE_NAME_MAX) {
      raise(ERROR_CODES.INVALID, "Name must be 80 characters or fewer");
    }
    await ctx.db.patch(profile._id, { displayName });
    return null;
  },
});

export const generateAvatarUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireProfile(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAvatar = authedMutation({
  args: {
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    if (!args.contentType.startsWith("image/")) {
      raise(ERROR_CODES.INVALID, "Upload an image file");
    }
    if (args.sizeBytes <= 0 || args.sizeBytes > PROFILE_PHOTO_MAX_BYTES) {
      raise(ERROR_CODES.INVALID, "Photo must be 10MB or smaller");
    }
    const fileId: Id<"files"> = await ctx.db.insert("files", {
      storageId: args.storageId,
      kind: "avatar",
      ownerProfileId: profile._id,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      createdAt: Date.now(),
    });
    await ctx.db.patch(profile._id, { avatarFileId: fileId });
    return null;
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
