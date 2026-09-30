import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const RECENT_CAP = 8;

function storageKey(profileId: string): string {
  return `kindred.search.recent.${profileId}`;
}

export interface RecentArtist {
  kind: "artist";
  artistId: string;
  name: string;
  detail: string;
  avatarUrl: string | null;
}

export interface RecentTrack {
  kind: "track";
  trackId: string;
  artistId: string;
  title: string;
  artistName: string;
  artworkUrl: string | null;
  durationMs: number;
}

export type RecentSearchItem = RecentArtist | RecentTrack;

export function recentArtist(artist: {
  artistId: string;
  name: string;
  detail: string;
  avatarUrl: string | null;
}): RecentArtist {
  return {
    kind: "artist",
    artistId: artist.artistId,
    name: artist.name,
    detail: artist.detail,
    avatarUrl: artist.avatarUrl,
  };
}

export function recentTrack(track: {
  trackId: string;
  artistId: string;
  title: string;
  artistName: string;
  artworkUrl: string | null;
  durationMs: number;
}): RecentTrack {
  return {
    kind: "track",
    trackId: track.trackId,
    artistId: track.artistId,
    title: track.title,
    artistName: track.artistName,
    artworkUrl: track.artworkUrl,
    durationMs: track.durationMs,
  };
}

function sameItem(left: RecentSearchItem, right: RecentSearchItem): boolean {
  if (left.kind === "artist" && right.kind === "artist") {
    return left.artistId === right.artistId;
  }
  if (left.kind === "track" && right.kind === "track") {
    return left.trackId === right.trackId;
  }
  return false;
}

/** Newest first. Opening the same artist or track again moves it to the front. */
export function rememberSearch(
  items: RecentSearchItem[],
  item: RecentSearchItem
): RecentSearchItem[] {
  return [item, ...items.filter((row) => !sameItem(row, item))].slice(
    0,
    RECENT_CAP
  );
}

export function forgetSearch(
  items: RecentSearchItem[],
  item: RecentSearchItem
): RecentSearchItem[] {
  return items.filter((row) => !sameItem(row, item));
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function readArtist(row: Record<string, unknown>): RecentArtist | null {
  if (
    row.kind !== "artist" ||
    typeof row.artistId !== "string" ||
    typeof row.name !== "string" ||
    typeof row.detail !== "string" ||
    !isNullableString(row.avatarUrl)
  ) {
    return null;
  }
  return {
    kind: "artist",
    artistId: row.artistId,
    name: row.name,
    detail: row.detail,
    avatarUrl: row.avatarUrl,
  };
}

function readTrack(row: Record<string, unknown>): RecentTrack | null {
  if (
    row.kind !== "track" ||
    typeof row.trackId !== "string" ||
    typeof row.artistId !== "string" ||
    typeof row.title !== "string" ||
    typeof row.artistName !== "string" ||
    !isNullableString(row.artworkUrl) ||
    typeof row.durationMs !== "number"
  ) {
    return null;
  }
  return {
    kind: "track",
    trackId: row.trackId,
    artistId: row.artistId,
    title: row.title,
    artistName: row.artistName,
    artworkUrl: row.artworkUrl,
    durationMs: row.durationMs,
  };
}

function readItems(raw: string | null): RecentSearchItem[] {
  if (raw === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((row) => {
      if (typeof row !== "object" || row === null) {
        return [];
      }
      const item =
        readArtist(row as Record<string, unknown>) ??
        readTrack(row as Record<string, unknown>);
      return item === null ? [] : [item];
    });
  } catch {
    return [];
  }
}

export function useRecentSearches(profileId: string | null) {
  const [ownerId, setOwnerId] = useState(profileId);
  const [items, setItems] = useState<RecentSearchItem[] | null>(
    profileId === null ? [] : null
  );
  const itemsRef = useRef<RecentSearchItem[] | null>(
    profileId === null ? [] : null
  );

  if (profileId !== ownerId) {
    setOwnerId(profileId);
    setItems(profileId === null ? [] : null);
  }

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (profileId === null) {
      return;
    }
    let cancelled = false;
    void AsyncStorage.getItem(storageKey(profileId)).then((raw) => {
      if (cancelled) {
        return;
      }
      const next = readItems(raw);
      itemsRef.current = next;
      setItems(next);
    });
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const write = useCallback(
    async (next: RecentSearchItem[]) => {
      if (profileId === null) {
        return;
      }
      itemsRef.current = next;
      setItems(next);
      await AsyncStorage.setItem(storageKey(profileId), JSON.stringify(next));
    },
    [profileId]
  );

  const remember = useCallback(
    async (item: RecentSearchItem) => {
      if (itemsRef.current === null) {
        return;
      }
      await write(rememberSearch(itemsRef.current, item));
    },
    [write]
  );

  const forget = useCallback(
    async (item: RecentSearchItem) => {
      if (itemsRef.current === null) {
        return;
      }
      await write(forgetSearch(itemsRef.current, item));
    },
    [write]
  );

  const clear = useCallback(async () => {
    if (itemsRef.current === null) {
      return;
    }
    await write([]);
  }, [write]);

  return { items, remember, forget, clear };
}
