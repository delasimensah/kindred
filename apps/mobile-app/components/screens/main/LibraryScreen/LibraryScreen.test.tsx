import { fireEvent, render, screen } from "@testing-library/react-native";

import LibraryScreen from "./LibraryScreen";

describe("LibraryScreen", () => {
  it("opens each library destination and a recent playlist", () => {
    const onOpenArtist = jest.fn();
    const onOpenPlaylists = jest.fn();
    const onOpenPlaylist = jest.fn();
    const onOpenLiked = jest.fn();
    const onOpenDownloads = jest.fn();
    const onOpenArtists = jest.fn();
    const onOpenMix = jest.fn();
    render(
      <LibraryScreen
        displayName="Efua Boateng"
        artists={[
          {
            artistId: "artist_1",
            name: "Amaara Mensah",
            avatarUrl: null,
            supporting: true,
          },
          ...[
            "Kweku Darko",
            "Sela Okoro",
            "Téwá Nkrumah",
            "Leye Ade",
            "Nia Osei",
          ].map((name, index) => ({
            artistId: `artist_${index + 2}`,
            name,
            avatarUrl: null,
            supporting: false,
          })),
        ]}
        recentPlaylists={[
          {
            playlistId: "playlist_1",
            name: "Accra After Dark",
            trackCount: 10,
            artworkUrls: [],
          },
        ]}
        onOpenAccount={jest.fn()}
        onOpenArtist={onOpenArtist}
        onOpenPlaylists={onOpenPlaylists}
        onOpenPlaylist={onOpenPlaylist}
        onOpenLiked={onOpenLiked}
        onOpenDownloads={onOpenDownloads}
        onOpenArtists={onOpenArtists}
        onOpenMix={onOpenMix}
      />
    );
    fireEvent.press(screen.getByLabelText("Open Amaara Mensah, supporting"));
    fireEvent.press(screen.getByLabelText("View all artists"));
    expect(screen.queryByLabelText("Open Nia Osei")).toBeNull();
    fireEvent.press(screen.getByLabelText("Playlists"));
    fireEvent.press(screen.getByLabelText("Liked songs"));
    fireEvent.press(screen.getByLabelText("Downloaded"));
    fireEvent.press(screen.getByLabelText("Make a mix"));
    fireEvent.press(screen.getByLabelText("Open Accra After Dark"));
    expect(onOpenArtist).toHaveBeenCalledWith("artist_1");
    expect(onOpenPlaylists).toHaveBeenCalledTimes(1);
    expect(onOpenLiked).toHaveBeenCalledTimes(1);
    expect(onOpenDownloads).toHaveBeenCalledTimes(1);
    expect(onOpenArtists).toHaveBeenCalledTimes(1);
    expect(onOpenMix).toHaveBeenCalledTimes(1);
    expect(onOpenPlaylist).toHaveBeenCalledWith(
      "playlist_1",
      "Accra After Dark"
    );
    expect(screen.getByText("10 tracks")).toBeTruthy();
  });
});
