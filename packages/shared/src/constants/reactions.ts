/** The fixed set on now-playing. One reaction per person per track. */
export const REACTION_EMOJIS = ["🔥", "❤️", "🙌", "👏", "✨"] as const;

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

/** Convex field names cannot be emoji, so counts use these keys. */
export const REACTION_COUNT_KEY: Record<ReactionEmoji, string> = {
  "🔥": "fire",
  "❤️": "heart",
  "🙌": "praise",
  "👏": "clap",
  "✨": "sparkle",
};

export function isReactionEmoji(value: string): value is ReactionEmoji {
  return (REACTION_EMOJIS as readonly string[]).includes(value);
}
