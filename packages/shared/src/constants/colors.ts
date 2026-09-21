/**
 * Kindred color tokens (locked).
 *
 * Source: docs/design/design-system.md — Color Hunt
 * #222831 #393E46 #FFD369 #EEEEEE
 *
 * Do not invent a fifth brand hex. Muted chrome uses surface + text opacity.
 * Destructive actions use platform red only (not brand).
 */

/** Secondary / meta text: apply as `text` at this opacity (e.g. text/60). */
export const TEXT_SECONDARY_OPACITY = 0.6;

export const COLORS = {
  /** Canvas — app and studio page fill. */
  page: "#222831",
  /** Sheets, elevated rows, cards, panels. */
  surface: "#393E46",
  /** Support, Follow, Play, active tab, key links. */
  primary: "#FFD369",
  /** Primary UI copy. */
  text: "#EEEEEE",
  /** Label on primary (gold) buttons — same hex as page. */
  textOnPrimary: "#222831",

  white: "#FFFFFF",
  black: "#000000",

  /**
   * Destructive only (remove download, decline).
   * Approximate iOS system red / Material error — not a brand color.
   */
  danger: "#FF3B30",
} as const;
