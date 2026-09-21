import localFont from "next/font/local";

/**
 * Web fonts — Fontshare files under apps/web-app/assets/fonts/.
 * Full load notes: docs/design/fonts.md
 *
 * Satoshi has no separate SemiBold OTF in-repo; Bold is registered at 600 and 700.
 */

export const satoshi = localFont({
  src: [
    {
      path: "../assets/fonts/Satoshi-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/Satoshi-Bold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/Satoshi-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-ui",
  display: "swap",
});

export const clashDisplay = localFont({
  src: [
    {
      path: "../assets/fonts/ClashDisplay-Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/ClashDisplay-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

/** @deprecated Prefer `satoshi` — kept for older imports. */
export const appfont = satoshi;
