import { COLORS, FONTS } from "@/constants";

/**
 * Default screen options for Stack navigator
 * Provides consistent styling across all screens
 */
export const defaultStackScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.page,
  },
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    fontFamily: FONTS.regular,
  },
  contentStyle: {
    backgroundColor: COLORS.page,
  },
};

/**
 * Common screen option presets
 * Use these for consistent screen configurations
 */
export const screenPresets = {
  /**
   * Hide the header for nested navigators
   */
  noHeader: {
    headerShown: false,
  },

  /**
   * Modal presentation style
   */
  modal: {
    presentation: "modal" as const,
  },

  /**
   * Full screen modal
   */
  fullScreenModal: {
    presentation: "fullScreenModal" as const,
  },

  /**
   * Transparent modal
   */
  transparentModal: {
    presentation: "transparentModal" as const,
  },

  /**
   * Transparent header with no title
   */
  transparentHeader: {
    headerTransparent: true,
    headerTitle: "",
    headerStyle: {
      backgroundColor: "transparent",
    },
  },
};
