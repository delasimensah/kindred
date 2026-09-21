# Shared package

Code shared by the Kindred web and mobile apps: types, utils, design tokens, and Zod schemas.

Design tokens (both apps must use these — no one-off hex in screens):

- `src/constants/colors.ts` — page, surface, primary, text, textOnPrimary, danger; `TEXT_SECONDARY_OPACITY`
- `src/constants/radii.ts` — input, card, button, full
- `src/constants/typography.ts` — font family names, weights, size bands

Font file load paths: `docs/design/fonts.md`.

See [contributing-guide.md](./docs/contributing-guide.md).
