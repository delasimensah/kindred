import { v } from "convex/values";

import { action } from "./_generated/server";

type ReleaseCopySuggestion = {
  tags: string[];
  description: string;
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
