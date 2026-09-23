import { DarkTheme, type Href } from "expo-router";

import { COLORS, FONTS } from "@/constants";

/** Account modal above the tab shell — open from any tab avatar. */
export const ACCOUNT_HREF = "/(main-app)/account" as Href;

/** How many popular tracks the artist page loads before View all. */
export const POPULAR_TRACK_PREVIEW = 5;

export function routeParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Artist profile on the Discover stack, above the tab bar. */
export function artistHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/discover/artist/[artistId]",
    params: { artistId },
  };
}

/** Full popular-track list for one artist, still on the Discover stack. */
export function artistTracksHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/discover/tracks/[artistId]",
    params: { artistId },
  };
}

export function libraryPlaylistsHref(): Href {
  return "/(main-app)/(tabs)/library/playlists";
}

export function libraryNewPlaylistHref(): Href {
  return "/(main-app)/(tabs)/library/playlists/new";
}

export function libraryPlaylistHref(playlistId: string, name?: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/library/playlist/[playlistId]",
    params:
      name === undefined || name.length === 0
        ? { playlistId }
        : { playlistId, name },
  };
}

export function libraryAddTracksHref(playlistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/library/playlist/[playlistId]/add",
    params: { playlistId },
  };
}

export function libraryLikedHref(): Href {
  return "/(main-app)/(tabs)/library/liked";
}

export function libraryArtistsHref(): Href {
  return "/(main-app)/(tabs)/library/artists";
}

export function libraryDownloadsHref(): Href {
  return "/(main-app)/(tabs)/library/downloads";
}

export function libraryMixHref(): Href {
  return "/(main-app)/(tabs)/library/mix";
}

export function libraryArtistHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/library/artist/[artistId]",
    params: { artistId },
  };
}

export function libraryArtistTracksHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/library/tracks/[artistId]",
    params: { artistId },
  };
}

export function libraryTrackHref(trackId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/library/track/[trackId]",
    params: { trackId },
  };
}

/** Supporters-only track gate on the Discover stack. */
export function trackHref(trackId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/discover/track/[trackId]",
    params: { trackId },
  };
}

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
 * Native stack inside a tab. Pushed screens keep the system back button.
 * https://docs.expo.dev/router/advanced/stack/
 */
export const tabStackScreenOptions = {
  ...defaultStackScreenOptions,
  headerShown: true,
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal" as const,
};

/**
 * Header floats over a full-bleed cover and keeps the system back button.
 * headerTransparent stays opaque when headerStyle sets a background color.
 * https://docs.expo.dev/router/advanced/stack/
 */
export const coverHeaderScreenOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: "",
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal" as const,
  headerTintColor: COLORS.text,
  headerStyle: {
    backgroundColor: "transparent" as const,
  },
  scrollEdgeEffects: {
    top: "hidden" as const,
  },
};

/** Navigator chrome during push/pop. DefaultTheme is light and flashes white. */
export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.page,
    card: COLORS.page,
    text: COLORS.text,
    border: COLORS.surface,
    notification: COLORS.danger,
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
