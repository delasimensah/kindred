import { fireEvent, render, screen } from "@testing-library/react-native";

import ArtistProfileScreen from "./ArtistProfileScreen";

const artist = {
  name: "Amaara Mensah",
  bio: "Afro-soul and R&B · Accra",
  avatarUrl: null,
  coverUrl: null,
  isFollowed: false,
  followerCount: 12,
  supporterCount: 25,
  liveListenerCount: 2,
};

const now = Date.UTC(2026, 8, 23, 12, 0, 0);

const screenProps = {
  artist,
  tracks: [
    {
      trackId: "track_asase",
      title: "Asase",
      artworkUrl: null,
      durationMs: 212000,
      locked: false,
      liked: false,
    },
    {
      trackId: "track_night",
      title: "Night Mix",
      artworkUrl: null,
      durationMs: 180000,
      locked: true,
      liked: false,
    },
  ],
  updates: [
    {
      postId: "post_1",
      createdAt: now - 2 * 60 * 60 * 1000,
      audience: "everyone" as const,
      body: "Asase is finished.",
      locked: false,
    },
  ],
  isLoading: false,
  now,
  hasMoreTracks: true,
  hasMoreAlbums: true,
  albums: [
    {
      releaseId: "release_1",
      title: "Lagoon Sessions",
      type: "ep" as const,
      artworkUrl: null,
      trackCount: 4,
    },
  ],
  playingTrackId: null,
  isPlaying: false,
  onToggleFollow: jest.fn(),
  onPlay: jest.fn(),
  onToggleLike: jest.fn(),
  onViewAllTracks: jest.fn(),
  onViewAllAlbums: jest.fn(),
  onOpenAlbum: jest.fn(),
  onSupport: jest.fn(),
};

describe("ArtistProfileScreen", () => {
  it("plays a public track, leaves a locked one, and offers view all", () => {
    const onPlay = jest.fn();
    const onViewAllTracks = jest.fn();
    const onViewAllAlbums = jest.fn();
    render(
      <ArtistProfileScreen
        {...screenProps}
        isFounding
        onPlay={onPlay}
        onViewAllTracks={onViewAllTracks}
        onViewAllAlbums={onViewAllAlbums}
      />
    );

    expect(screen.getByText("Popular tracks")).toBeTruthy();
    expect(screen.getByLabelText("Founding supporter")).toBeTruthy();
    expect(screen.getByText("Albums")).toBeTruthy();
    expect(screen.getByText("Updates")).toBeTruthy();
    expect(screen.getByText("Asase is finished.")).toBeTruthy();
    expect(screen.getByLabelText("2 listening now")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Play Asase"));
    expect(onPlay).toHaveBeenCalledWith("track_asase");
    fireEvent.press(screen.getByLabelText("Night Mix, supporters only"));
    expect(onPlay).not.toHaveBeenCalledWith("track_night");
    expect(screen.getByLabelText("More options for Night Mix")).toBeDisabled();
    fireEvent.press(screen.getByLabelText("View all popular tracks"));
    expect(onViewAllTracks).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText("View all albums"));
    expect(onViewAllAlbums).toHaveBeenCalledTimes(1);
  });

  it("shows a skeleton while the artist is loading", () => {
    render(<ArtistProfileScreen {...screenProps} artist={null} isLoading />);
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(3);
    expect(screen.queryByText("Loading artist…")).toBeNull();
  });
});
