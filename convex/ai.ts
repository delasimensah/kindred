import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { ERROR_CODES, raise } from "./lib/errors";

type ReleaseCopySuggestion = {
  tags: string[];
  description: string;
};

type ThankCandidate = {
  profileId: Id<"profiles">;
  displayName: string;
  avatarUrl: string | null;
  startedAt: number;
  founding: boolean;
  listenMs30d: number;
  draft: string;
};

/**
 * Optional upload copilot. Returns null until an LLM is wired so the
 * artist can keep typing tags and description by hand.
 */
export const suggestReleaseCopy = action({
  args: {
    title: v.string(),
    genre: v.string(),
  },
  returns: v.union(
    v.object({
      tags: v.array(v.string()),
      description: v.string(),
    }),
    v.null()
  ),
  handler: async (_ctx, _args): Promise<ReleaseCopySuggestion | null> => {
    return null;
  },
});

/**
 * Fans-to-thank shortlist. Ranking is deterministic (see thankYous.rankCandidates).
 * The draft one-liner is a template until an LLM is wired.
 */
export const rankFansToThank = action({
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
  handler: async (ctx): Promise<ThankCandidate[]> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      raise(ERROR_CODES.UNAUTHENTICATED);
    }
    return await ctx.runQuery(api.thankYous.rankCandidates, {});
  },
});
