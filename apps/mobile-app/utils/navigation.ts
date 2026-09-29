import { DarkTheme, type Href } from "expo-router";

import { COLORS, FONTS } from "@/constants";

/** Account modal above the tab shell — open from any tab avatar. */
export const ACCOUNT_HREF = "/(main-app)/account" as Href;

/** Become-an-artist form, pushed inside the account modal. */
export const ACCOUNT_REQUEST_HREF = "/(main-app)/account/request" as Href;

/** Supporter paywall, a sheet over the signed-in app. */
export const PAYWALL_HREF = "/(main-app)/paywall" as Href;

/** Locked track gate. Support and See plans on that screen open the paywall. */
export function lockedTrackHref(track: {
  title: string;
  artistName: string;
  artworkUrl: string | null;
}): Href {
  const query = new URLSearchParams({
    title: track.title,
    artistName: track.artistName,
    artworkUrl: track.artworkUrl ?? "",
  });
  return `/(main-app)/locked-track?${query.toString()}` as Href;
}

/** How many popular tracks the artist page loads before View all. */
export const POPULAR_TRACK_PREVIEW = 5;

/** How many albums the artist page shows before View all. */
export const ALBUM_PREVIEW = 6;

/** How many rising artists Discover shows before View all. */
export const RISING_PREVIEW = 8;

export function routeParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Full rising-artist list, still on the Discover stack. */
export function risingArtistsHref(): Href {
  return "/(main-app)/(tabs)/discover/rising";
}

/** Artist profile on the Discover stack. Home and Library keep their own. */
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

/** Full albums list for one artist, still on the Discover stack. */
export function artistAlbumsHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/discover/albums/[artistId]",
    params: { artistId },
  } as unknown as Href;
}

/** Album detail on the Discover stack. */
export function artistAlbumHref(releaseId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/discover/album/[releaseId]",
    params: { releaseId },
  } as unknown as Href;
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

/** Artist profile on the Home stack, so back returns to the feed. */
export function homeArtistHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/(home)/artist/[artistId]",
    params: { artistId },
  };
}

/** Full popular-track list opened from Home, still on the Home stack. */
export function homeArtistTracksHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/(home)/tracks/[artistId]",
    params: { artistId },
  };
}

export function homeArtistAlbumsHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/(home)/albums/[artistId]",
    params: { artistId },
  } as unknown as Href;
}

export function homeArtistAlbumHref(releaseId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/(home)/album/[releaseId]",
    params: { releaseId },
  } as unknown as Href;
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

export function libraryArtistAlbumsHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/library/albums/[artistId]",
    params: { artistId },
  } as unknown as Href;
}

export function libraryArtistAlbumHref(releaseId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/library/album/[releaseId]",
    params: { releaseId },
  } as unknown as Href;
}

/** Artist profile on the Search stack, so back returns to the results. */
export function searchArtistHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/search/artist/[artistId]",
    params: { artistId },
  } as unknown as Href;
}

export function searchArtistTracksHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/search/tracks/[artistId]",
    params: { artistId },
  } as unknown as Href;
}

export function searchArtistAlbumsHref(artistId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/search/albums/[artistId]",
    params: { artistId },
  } as unknown as Href;
}

export function searchArtistAlbumHref(releaseId: string): Href {
  return {
    pathname: "/(main-app)/(tabs)/search/album/[releaseId]",
    params: { releaseId },
  } as unknown as Href;
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
    fontFamily: FONTS.medium,
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
