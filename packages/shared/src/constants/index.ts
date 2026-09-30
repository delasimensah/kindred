// Shared constants
export const API_DEFAULT_TIMEOUT = 30000;

export const QUERY_DEFAULT_OPTIONS = {
  retry: 1,
  refetchOnWindowFocus: false,
};

export { TRACK_PEAK_BUCKETS, VOICE_PEAK_BUCKETS } from "./catalog";
export {
  ARTIST_POOL_RATIO,
  artistShareCents,
  equalSharePercent,
  equalSplitCents,
  recordedShareCents,
  formatUsdFromCents,
  periodKey,
  previousPeriodKey,
  STORE_FEE_RATIO,
  THANK_YOU_SHORTLIST,
  TIER_CENTS,
  type PriceTier,
} from "./earnings";
export {
  ARTIST_REQUEST_BIO_MAX,
  ARTIST_REQUEST_NAME_MAX,
  ARTIST_REQUEST_WHY_MAX,
} from "./artistRequest";
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
export {
  FOUNDING_SUPPORTER_LIMIT,
  isFoundingSupporter,
  SUPPORTER_ENTITLEMENT,
  SUPPORTER_PRODUCT_499,
  SUPPORTER_PRODUCT_999,
} from "./support";
export { RADII } from "./radii";
export {
  FONT_FAMILIES,
  FONT_WEIGHTS,
  MOBILE_TYPE,
  WEB_TYPE,
} from "./typography";
