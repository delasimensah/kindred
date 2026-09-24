import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

import LibraryTracksScreen from "./LibraryTracksScreen";

const tracks = [
  {
    trackId: "tr_open",
    title: "Accra Night",
    artistName: "Amaara Mensah",
    artworkUrl: null,
    durationMs: 180000,
    locked: false,
    liked: false,
  },
  {
    trackId: "tr_locked",
    title: "Quiet Room",
    artistName: "Amaara Mensah",
    artworkUrl: null,
    durationMs: 120000,
    locked: true,
    liked: true,
  },
];

describe("LibraryTracksScreen", () => {
  it("plays a public track, keeps a locked track, and removes a row", () => {
    const onPlay = jest.fn();
    const onToggleLike = jest.fn();
    const onRemove = jest.fn();
    render(
      <LibraryTracksScreen
        tracks={tracks}
        isLoading={false}
        empty={{
          icon: "heart",
          title: "No liked songs yet",
          subtitle: "Tap the heart on a track and it stays here.",
        }}
        playingTrackId={null}
        isPlaying={false}
        onPlay={onPlay}
        onToggleLike={onToggleLike}
        onRemove={onRemove}
      />
    );
    fireEvent.press(screen.getByLabelText("Play Accra Night"));
    fireEvent.press(screen.getByLabelText("Like Accra Night"));
    const alert = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        const confirm = buttons?.find(
          (button) => button.style === "destructive"
        );
        confirm?.onPress?.();
      });
    fireEvent.press(screen.getByLabelText("Delete Accra Night"));
    alert.mockRestore();
    fireEvent.press(screen.getByLabelText("Quiet Room, supporters only"));
    expect(onPlay).toHaveBeenCalledWith("tr_open");
    expect(onPlay).not.toHaveBeenCalledWith("tr_locked");
    expect(onToggleLike).toHaveBeenCalledWith("tr_open");
    expect(onRemove).toHaveBeenCalledWith("tr_open");
    expect(screen.getByLabelText("More options for Quiet Room")).toBeDisabled();
  });
});
