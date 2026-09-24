/** Keep in lockstep with packages/shared/src/constants/reactions.ts */
export const REACTION_EMOJIS = ["🔥", "❤️", "🙌", "👏", "✨"] as const;

const COUNT_KEY = {
  "🔥": "fire",
  "❤️": "heart",
  "🙌": "praise",
  "👏": "clap",
  "✨": "sparkle",
} as const;

export type ReactionCountKey = (typeof COUNT_KEY)[ReactionEmoji];

type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

const REACTION_SET = new Set<string>(REACTION_EMOJIS);

export function isReactionEmoji(value: string): value is ReactionEmoji {
  return REACTION_SET.has(value);
}

export function reactionCountKey(emoji: ReactionEmoji): ReactionCountKey {
  return COUNT_KEY[emoji];
}

export const EMPTY_REACTION_COUNTS = {
  fire: 0,
  heart: 0,
  praise: 0,
  clap: 0,
  sparkle: 0,
};
