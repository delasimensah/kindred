import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ComponentProps } from "react";

import type { RecentArtist, RecentTrack } from "@/hooks";

import SearchTabScreen, {
  type SearchArtistResult,
  type SearchTrackResult,
} from "./SearchTabScreen";

const artist: SearchArtistResult = {
  artistId: "artist_amaara",
  name: "Amaara Mensah",
  detail: "Artist · Afro-soul and R&B",
  avatarUrl: null,
  isFollowed: false,
};

const track: SearchTrackResult = {
  trackId: "track_asase",
  artistId: "artist_amaara",
  title: "Asase",
  artistName: "Amaara Mensah",
  artworkUrl: null,
  durationMs: 180000,
  locked: false,
  liked: false,
};

const locked: SearchTrackResult = {
  ...track,
  trackId: "track_quiet",
  title: "Quiet Room",
  locked: true,
};

function renderSearch(
  props: Partial<ComponentProps<typeof SearchTabScreen>> = {}
) {
  return render(
    <SearchTabScreen
      draft=""
      onChangeDraft={jest.fn()}
      artists={[]}
      tracks={[]}
      isLoading={false}
      hasQuery={false}
      recent={[]}
      genres={[]}
      onOpenGenre={jest.fn()}
      onOpenRecentArtist={jest.fn()}
      onPlayRecentTrack={jest.fn()}
      onForgetRecent={jest.fn()}
      onClearRecent={jest.fn()}
      playingTrackId={null}
      isPlaying={false}
      onToggleFollow={jest.fn()}
      onOpenArtist={jest.fn()}
      onPlay={jest.fn()}
      onPlayNext={jest.fn()}
      onAddToQueue={jest.fn()}
      onToggleLike={jest.fn()}
      {...props}
    />
  );
}

describe("SearchTabScreen", () => {
  it("shows the empty search state until a search is running", () => {
    renderSearch();
    expect(screen.getByText("Find artists and tracks")).toBeTruthy();
    expect(
      screen.getByText("Profiles you open and tracks you play show up here.")
    ).toBeTruthy();
    expect(screen.queryByText("Top results")).toBeNull();
  });

  it("opens a genre from the search home", () => {
    const onOpenGenre = jest.fn();
    renderSearch({
      genres: [{ genre: "Highlife", artworkUrl: null }],
      onOpenGenre,
    });
    fireEvent.press(screen.getByLabelText("Open Highlife"));
    expect(onOpenGenre).toHaveBeenCalledWith("Highlife");
    expect(screen.queryByText("Find artists and tracks")).toBeNull();
  });

  it("shows an artist before a track, and keeps a locked track locked", () => {
    const onOpenArtist = jest.fn();
    const onToggleFollow = jest.fn();
    const onPlay = jest.fn();
    renderSearch({
      draft: "ama",
      hasQuery: true,
      artists: [artist],
      tracks: [track, locked],
      onOpenArtist,
      onToggleFollow,
      onPlay,
    });
    expect(screen.getByText("Top results")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Open Amaara Mensah"));
    fireEvent.press(screen.getByLabelText("Follow Amaara Mensah"));
    fireEvent.press(screen.getByLabelText("Play Asase"));
    fireEvent.press(screen.getByLabelText("Quiet Room, supporters only"));
    expect(onOpenArtist).toHaveBeenCalledWith("artist_amaara");
    expect(onToggleFollow).toHaveBeenCalledWith("artist_amaara");
    expect(onPlay).toHaveBeenCalledWith("track_asase");
    expect(onPlay).not.toHaveBeenCalledWith("track_quiet");
  });

  it("shows recent-row skeletons while saved searches load", () => {
    renderSearch({ recent: null });
    expect(screen.getByTestId("recent-search-skeleton")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBe(16);
    expect(screen.queryByText("Find artists and tracks")).toBeNull();
  });

  it("shows result-shaped skeletons while the first search loads", () => {
    renderSearch({ draft: "ama", hasQuery: true, isLoading: true });
    expect(screen.getByTestId("search-skeleton")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBe(20);
    expect(screen.queryByText("Find artists and tracks")).toBeNull();
  });

  it("opens a recent artist, plays a recent track, and can clear the list", () => {
    const recentArtist: RecentArtist = {
      kind: "artist",
      artistId: artist.artistId,
      name: artist.name,
      detail: artist.detail,
      avatarUrl: null,
    };
    const recentTrack: RecentTrack = {
      kind: "track",
      trackId: track.trackId,
      artistId: track.artistId,
      title: track.title,
      artistName: track.artistName,
      artworkUrl: null,
      durationMs: track.durationMs,
    };
    const onOpenRecentArtist = jest.fn();
    const onPlayRecentTrack = jest.fn();
    const onForgetRecent = jest.fn();
    const onClearRecent = jest.fn();
    renderSearch({
      recent: [recentArtist, recentTrack],
      onOpenRecentArtist,
      onPlayRecentTrack,
      onForgetRecent,
      onClearRecent,
    });
    fireEvent.press(screen.getByLabelText("Open Amaara Mensah"));
    fireEvent.press(screen.getByLabelText("Play Asase"));
    fireEvent.press(screen.getByLabelText("Remove Asase from recent searches"));
    fireEvent.press(screen.getByLabelText("Clear recent searches"));
    expect(onOpenRecentArtist).toHaveBeenCalledWith(artist.artistId);
    expect(onPlayRecentTrack).toHaveBeenCalledWith(track.trackId);
    expect(onForgetRecent).toHaveBeenCalledWith(recentTrack);
    expect(onClearRecent).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Find artists and tracks")).toBeNull();
  });

  it("says when nothing matches", () => {
    renderSearch({ draft: "zzzz", hasQuery: true });
    expect(screen.getByText("No matches")).toBeTruthy();
  });
});
