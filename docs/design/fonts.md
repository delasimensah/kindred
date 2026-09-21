# Fonts — Kindred

**Status:** locked with the design system (Clash Display + Satoshi from Fontshare).

Sources:

- [Fontshare — Clash Display](https://www.fontshare.com/fonts/clash-display) — SemiBold 600, Bold 700
- [Fontshare — Satoshi](https://www.fontshare.com/fonts/satoshi) — Light, Regular, Medium, Bold, Black

## Shared tokens

Family names and weights live in `packages/shared/src/constants/typography.ts` (`FONT_FAMILIES`, `FONT_WEIGHTS`). Apps must not invent alternate UI faces.

## Mobile (Expo)

- Files: `apps/mobile-app/assets/fonts/`
  - `Satoshi-*.otf`
  - `ClashDisplay-Semibold.ttf`, `ClashDisplay-Bold.ttf`
- Load map: `apps/mobile-app/constants/fonts.ts` (names) + `fontLoading.ts` (`FONT_LOADING_MAP` for `expo-font`)
- Wired in `apps/mobile-app/app/_layout.tsx` via `expo-font` `useFonts`
- NativeWind classes: `font-app-regular`, `font-app-medium`, `font-app-bold`, `font-display-semibold`, `font-display-bold`

Satoshi SemiBold (600) is not shipped as its own file yet. `FONTS.semibold` points at Bold until a SemiBold OTF is added.

## Web (Next.js)

- Same Fontshare files: `apps/web-app/assets/fonts/`
- Load: `apps/web-app/constants/fonts.ts` via `next/font/local` (`satoshi`, `clashDisplay`)
- CSS variables: `--font-ui`, `--font-display` on `<html>` in `apps/web-app/app/layout.tsx`
- Tailwind: `font-ui`, `font-display` (and legacy `font-appFont` → UI)

Do not use `next/font/google` for Kindred UI or display faces.

## Rights

Fontshare free license — OK for app and web product use. Keep the downloaded files in-repo; do not hotlink the Fontshare CDN in production screens.
