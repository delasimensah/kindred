/**
 * Font name tokens for NativeWind (`font-app-*`, `font-display-*`).
 * Binary load map lives in `fontLoading.ts` so Tailwind can import this file safely.
 * Paths and rights: docs/design/fonts.md
 */

export const FONTS = {
  light: "Satoshi-Light",
  regular: "Satoshi-Regular",
  medium: "Satoshi-Medium",
  /** No separate Satoshi SemiBold file yet — Bold stands in for 600. */
  semibold: "Satoshi-Bold",
  bold: "Satoshi-Bold",
  black: "Satoshi-Black",
  displaySemibold: "ClashDisplay-Semibold",
  displayBold: "ClashDisplay-Bold",
} as const;
