// Shared constants
export const API_DEFAULT_TIMEOUT = 30000;

export const QUERY_DEFAULT_OPTIONS = {
  retry: 1,
  refetchOnWindowFocus: false,
};

export { TRACK_PEAK_BUCKETS, VOICE_PEAK_BUCKETS } from "./catalog";
export { COLORS, TEXT_SECONDARY_OPACITY } from "./colors";
export {
  GENRE_ACCENTS,
  GENRES,
  isGenre,
  ONBOARDING_MIN_FOLLOWS,
  ONBOARDING_MIN_GENRES,
  type Genre,
} from "./genres";
export {
  isReactionEmoji,
  REACTION_COUNT_KEY,
  REACTION_EMOJIS,
  type ReactionEmoji,
} from "./reactions";
export {
  PRESENCE_CLEANUP_AFTER_MS,
  PRESENCE_FRESH_MS,
  PRESENCE_HEARTBEAT_MS,
} from "./presence";
export { RADII } from "./radii";
export {
  FONT_FAMILIES,
  FONT_WEIGHTS,
  MOBILE_TYPE,
  WEB_TYPE,
} from "./typography";
