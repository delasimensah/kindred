/**
 * expo-font loading map. Keep binary requires here (not in fonts.ts)
 * so Tailwind config can read FONTS without loading .otf/.ttf.
 */

import { FONTS } from "./fonts";

export const FONT_LOADING_MAP = {
  [FONTS.light]: require("../assets/fonts/Satoshi-Light.otf"),
  [FONTS.regular]: require("../assets/fonts/Satoshi-Regular.otf"),
  [FONTS.medium]: require("../assets/fonts/Satoshi-Medium.otf"),
  [FONTS.bold]: require("../assets/fonts/Satoshi-Bold.otf"),
  [FONTS.black]: require("../assets/fonts/Satoshi-Black.otf"),
  [FONTS.displaySemibold]: require("../assets/fonts/ClashDisplay-Semibold.ttf"),
  [FONTS.displayBold]: require("../assets/fonts/ClashDisplay-Bold.ttf"),
} as const;
