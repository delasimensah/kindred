import { fireEvent, render, screen } from "@testing-library/react-native";

import LibraryScreen from "./LibraryScreen";

describe("LibraryScreen", () => {
  it("opens each library destination", () => {
    const onOpenPlaylists = jest.fn();
    const onOpenLiked = jest.fn();
    const onOpenDownloads = jest.fn();
    const onOpenArtists = jest.fn();
    const onOpenMix = jest.fn();
    render(
      <LibraryScreen
        displayName="Efua Boateng"
        onOpenAccount={jest.fn()}
        onOpenPlaylists={onOpenPlaylists}
        onOpenLiked={onOpenLiked}
        onOpenDownloads={onOpenDownloads}
        onOpenArtists={onOpenArtists}
        onOpenMix={onOpenMix}
      />
    );
    fireEvent.press(screen.getByLabelText("Playlists"));
    fireEvent.press(screen.getByLabelText("Liked songs"));
    fireEvent.press(screen.getByLabelText("Downloaded"));
    fireEvent.press(screen.getByLabelText("Artists"));
    fireEvent.press(screen.getByLabelText("Make a mix"));
    expect(onOpenPlaylists).toHaveBeenCalledTimes(1);
    expect(onOpenLiked).toHaveBeenCalledTimes(1);
    expect(onOpenDownloads).toHaveBeenCalledTimes(1);
    expect(onOpenArtists).toHaveBeenCalledTimes(1);
    expect(onOpenMix).toHaveBeenCalledTimes(1);
  });
});
