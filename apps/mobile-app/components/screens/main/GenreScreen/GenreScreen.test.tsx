import { fireEvent, render, screen } from "@testing-library/react-native";

import GenreScreen from "./GenreScreen";

describe("GenreScreen", () => {
  it("opens an artist and plays a track", () => {
    const onOpenArtist = jest.fn();
    const onPlay = jest.fn();
    render(
      <GenreScreen
        isLoading={false}
        playingTrackId={null}
        isPlaying={false}
        artists={[
          {
            artistId: "artist_1",
            name: "Amaara Mensah",
            avatarUrl: null,
          },
        ]}
        tracks={[
          {
            trackId: "track_1",
            title: "Asase",
            artistId: "artist_1",
            artistName: "Amaara Mensah",
            artworkUrl: null,
            durationMs: 1000,
          },
        ]}
        onOpenArtist={onOpenArtist}
        onPlay={onPlay}
      />
    );
    fireEvent.press(screen.getByLabelText("Open Amaara Mensah"));
    fireEvent.press(screen.getByLabelText("Play Asase"));
    expect(onOpenArtist).toHaveBeenCalledWith("artist_1");
    expect(onPlay).toHaveBeenCalledWith("track_1");
  });
});
