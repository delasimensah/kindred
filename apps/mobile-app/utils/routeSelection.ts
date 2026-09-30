export const MAX_ROUTES = 5;

export function supportTarget(input: {
  entitled: boolean;
  routedArtistIds: readonly string[];
  artistId?: string;
}): "paywall" | "route" | "open" {
  if (!input.entitled) {
    return "paywall";
  }
  if (input.artistId === undefined) {
    return "route";
  }
  if (input.routedArtistIds.includes(input.artistId)) {
    return "open";
  }
  return "route";
}

export function initialRouteSelection(input: {
  followedIds: readonly string[];
  routedIds: readonly string[];
  startingArtistId?: string;
}): { selectedIds: string[]; lockedArtistId: string | null } {
  const followed = new Set(input.followedIds);
  const routed = input.routedIds.filter((id) => followed.has(id));
  const starting = input.startingArtistId;
  if (starting === undefined || !followed.has(starting)) {
    if (routed.length > 0) {
      return {
        selectedIds: routed.slice(0, MAX_ROUTES),
        lockedArtistId: null,
      };
    }
    if (
      input.followedIds.length > 0 &&
      input.followedIds.length <= MAX_ROUTES
    ) {
      return { selectedIds: [...input.followedIds], lockedArtistId: null };
    }
    return { selectedIds: [], lockedArtistId: null };
  }
  if (routed.length === 0) {
    if (input.followedIds.length <= MAX_ROUTES) {
      return { selectedIds: [...input.followedIds], lockedArtistId: starting };
    }
    return { selectedIds: [starting], lockedArtistId: starting };
  }
  const selected = routed.includes(starting) ? routed : [...routed, starting];
  return { selectedIds: selected, lockedArtistId: starting };
}

export function toggleRouteArtist(
  selectedIds: readonly string[],
  artistId: string,
  lockedArtistId: string | null
): string[] {
  if (artistId === lockedArtistId) {
    return [...selectedIds];
  }
  if (selectedIds.includes(artistId)) {
    return selectedIds.filter((id) => id !== artistId);
  }
  if (selectedIds.length >= MAX_ROUTES) {
    return [...selectedIds];
  }
  return [...selectedIds, artistId];
}

export function splitCallout(count: number): string {
  if (count < 1) {
    return "Select at least 1 artist to route your support";
  }
  if (count === 1) {
    return "Your whole subscription goes to this artist";
  }
  if (count > MAX_ROUTES) {
    return "Remove an artist to stay within 5";
  }
  return `Each gets ${Math.floor(100 / count)}%`;
}

function artistList(names: readonly string[]): string {
  return names.join(", ");
}

/** One line for a full route, or for a swap that is not saved yet. */
export function routeChangeLine(input: {
  selectedIds: readonly string[];
  routedIds: readonly string[];
  nameFor: (artistId: string) => string;
}): string | null {
  const { selectedIds, routedIds, nameFor } = input;
  if (selectedIds.length > MAX_ROUTES) {
    const adding = selectedIds.filter((id) => !routedIds.includes(id));
    const addingNames = adding.map(nameFor).filter((name) => name.length > 0);
    if (addingNames.length === 1) {
      return `5 is the limit. Turn off one artist so ${addingNames[0]} can take their place.`;
    }
    return "5 is the limit. Turn off one artist before you can add another.";
  }
  const removed = routedIds
    .filter((id) => !selectedIds.includes(id))
    .map(nameFor)
    .filter((name) => name.length > 0);
  const added = selectedIds
    .filter((id) => !routedIds.includes(id))
    .map(nameFor)
    .filter((name) => name.length > 0);
  if (removed.length > 0 && added.length > 0) {
    return `Replacing ${artistList(removed)} with ${artistList(added)}.`;
  }
  if (removed.length > 0) {
    return `Removing ${artistList(removed)} from your route.`;
  }
  if (added.length > 0 && selectedIds.length === MAX_ROUTES) {
    return `Adding ${artistList(added)}. 5 of 5.`;
  }
  if (selectedIds.length === MAX_ROUTES && routedIds.length >= MAX_ROUTES) {
    return "5 of 5. Turn someone off to route to a different artist.";
  }
  return null;
}

export function routeStatusLine(routedNames: readonly string[]): string | null {
  if (routedNames.length === 0) {
    return null;
  }
  const countLabel =
    routedNames.length === 1 ? "1 artist" : `${routedNames.length} artists`;
  return `Already routing to ${countLabel}: ${routedNames.join(", ")}.`;
}

export function canSaveRoute(
  selectedIds: readonly string[],
  lockedArtistId: string | null
): boolean {
  if (selectedIds.length < 1 || selectedIds.length > MAX_ROUTES) {
    return false;
  }
  if (lockedArtistId !== null && !selectedIds.includes(lockedArtistId)) {
    return false;
  }
  return true;
}
