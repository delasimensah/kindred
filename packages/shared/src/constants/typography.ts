/**
 * Kindred type tokens (locked in docs/design/design-system.md).
 *
 * Families are Fontshare: Clash Display (display) + Satoshi (UI).
 * Platform load paths: docs/design/fonts.md
 */

export const FONT_FAMILIES = {
  /** Body, titles, tables, controls. */
  ui: "Satoshi",
  /** Now-playing titles, impact numbers, thank-you / paywall headlines. */
  display: "Clash Display",
} as const;

export const FONT_WEIGHTS = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/** Mobile UI sizes (px) from the design system. */
export const MOBILE_TYPE = {
  display: { min: 28, max: 36 },
  title: { min: 20, max: 24 },
  body: 16,
  meta: { min: 13, max: 14 },
} as const;

/** Web UI sizes (px) from the design system. */
export const WEB_TYPE = {
  display: { min: 32, max: 40 },
  pageTitle: { min: 28, max: 32 },
  section: { min: 18, max: 20 },
  body: { min: 15, max: 16 },
  table: { min: 13, max: 14 },
} as const;
