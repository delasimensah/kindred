import { fireEvent, render, screen } from "@testing-library/react-native";

import PopularTracksScreen from "./PopularTracksScreen";

describe("PopularTracksScreen", () => {
  it("plays a track from the full list", () => {
    const onPlay = jest.fn();
    render(
      <PopularTracksScreen
        tracks={[
          {
            trackId: "track_asase",
            title: "Asase",
            artworkUrl: null,
            durationMs: 212000,
            locked: false,
            liked: false,
          },
        ]}
        isLoading={false}
        playingTrackId={null}
        isPlaying={false}
        onPlay={onPlay}
        onToggleLike={jest.fn()}
        onOpenLocked={jest.fn()}
      />
    );
    fireEvent.press(screen.getByLabelText("Play Asase"));
    expect(onPlay).toHaveBeenCalledWith("track_asase");
  });

  it("shows a track-row skeleton while the list loads", () => {
    render(
      <PopularTracksScreen
        tracks={[]}
        isLoading
        playingTrackId={null}
        isPlaying={false}
        onPlay={jest.fn()}
        onToggleLike={jest.fn()}
        onOpenLocked={jest.fn()}
      />
    );
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(12);
  });
});
