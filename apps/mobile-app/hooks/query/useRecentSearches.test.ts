import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import {
  forgetSearch,
  type RecentArtist,
  type RecentTrack,
  rememberSearch,
  useRecentSearches,
} from "./useRecentSearches";

const artist: RecentArtist = {
  kind: "artist",
  artistId: "artist_amaara",
  name: "Amaara Mensah",
  detail: "Artist · Afro-soul and R&B",
  avatarUrl: null,
};

const track: RecentTrack = {
  kind: "track",
  trackId: "track_asase",
  artistId: "artist_amaara",
  title: "Asase",
  artistName: "Amaara Mensah",
  artworkUrl: null,
  durationMs: 180000,
};

describe("rememberSearch", () => {
  it("keeps the newest result first, drops duplicates, and caps the list", () => {
    expect(rememberSearch([track], artist)).toEqual([artist, track]);
    expect(rememberSearch([artist, track], artist)).toEqual([artist, track]);
    const many: RecentTrack[] = Array.from({ length: 8 }, (_, index) => ({
      ...track,
      trackId: `track_${index}`,
    }));
    expect(rememberSearch(many, artist)).toEqual([artist, ...many.slice(0, 7)]);
    expect(forgetSearch([artist, track], artist)).toEqual([track]);
  });
});

describe("useRecentSearches", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("loads a saved result and remembers a newer one at the front", async () => {
    await AsyncStorage.setItem(
      "kindred.search.recent.profile-efua",
      JSON.stringify([track])
    );
    const { result } = renderHook(() => useRecentSearches("profile-efua"));
    await waitFor(() => {
      expect(result.current.items).toEqual([track]);
    });
    await act(async () => {
      await result.current.remember(artist);
    });
    expect(result.current.items).toEqual([artist, track]);
  });

  it("keeps each signed-in person on their own list", async () => {
    await AsyncStorage.setItem(
      "kindred.search.recent",
      JSON.stringify([artist, track])
    );
    await AsyncStorage.setItem(
      "kindred.search.recent.profile-efua",
      JSON.stringify([artist])
    );
    await AsyncStorage.setItem(
      "kindred.search.recent.profile-akosua",
      JSON.stringify([track])
    );

    const { result, rerender } = renderHook(
      ({ profileId }: { profileId: string | null }) =>
        useRecentSearches(profileId),
      { initialProps: { profileId: "profile-efua" } }
    );
    await waitFor(() => {
      expect(result.current.items).toEqual([artist]);
    });

    rerender({ profileId: "profile-akosua" });
    await waitFor(() => {
      expect(result.current.items).toEqual([track]);
    });

    rerender({ profileId: null });
    expect(result.current.items).toEqual([]);
  });

  it("ignores an older list that only stored the words that were typed", async () => {
    await AsyncStorage.setItem(
      "kindred.search.recent.profile-efua",
      JSON.stringify(["amaara", "asase"])
    );
    const { result } = renderHook(() => useRecentSearches("profile-efua"));
    await waitFor(() => {
      expect(result.current.items).toEqual([]);
    });
  });
});
