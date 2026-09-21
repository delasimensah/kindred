import { createTheme, type MantineColorsTuple } from "@mantine/core";
import { COLORS, RADII } from "shared";

const kindredPrimary: MantineColorsTuple = [
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
  COLORS.primary,
];

const kindredDark: MantineColorsTuple = [
  COLORS.text,
  COLORS.text,
  COLORS.surface,
  COLORS.surface,
  COLORS.surface,
  COLORS.page,
  COLORS.page,
  COLORS.page,
  COLORS.page,
  COLORS.page,
];

/**
 * Mantine theme aligned with Kindred tokens from `packages/shared`.
 * Prefer Tailwind `className` for layout color; theme covers defaults.
 * See `docs/mantine-tailwind-theming-guide.md`.
 */
export const mantineTheme = createTheme({
  fontFamily: "var(--font-ui), system-ui, sans-serif",
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, Menlo, monospace",
  headings: {
    fontFamily: "var(--font-display), var(--font-ui), system-ui, sans-serif",
  },
  primaryColor: "kindred",
  colors: {
    kindred: kindredPrimary,
    dark: kindredDark,
  },
  defaultRadius: RADII.card,
  black: COLORS.page,
  white: COLORS.text,
});
