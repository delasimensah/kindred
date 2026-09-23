import { fireEvent, render, screen } from "@testing-library/react-native";

import TrackDetailScreen from "./TrackDetailScreen";

const openTrack = {
  title: "Asase",
  artistName: "Amaara Mensah",
  artistAvatarUrl: null,
  artworkUrl: null,
  durationMs: 212000,
  visibility: "public" as const,
  description: "Recorded in Accra.",
  locked: false,
};

describe("TrackDetailScreen", () => {
  it("plays a public track and shows its note", () => {
    const onPlay = jest.fn();
    render(
      <TrackDetailScreen
        track={openTrack}
        isLoading={false}
        isPlaying={false}
        onOpenArtist={jest.fn()}
        onPlay={onPlay}
        onSupport={jest.fn()}
      />
    );
    expect(screen.getByText("Recorded in Accra.")).toBeTruthy();
    expect(screen.getByText("Public · 3:32")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Play Asase"));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("shows a lock shell and support call to action", () => {
    const onSupport = jest.fn();
    render(
      <TrackDetailScreen
        track={{
          ...openTrack,
          title: "Night Mix",
          visibility: "supporters",
          description: null,
          locked: true,
        }}
        isLoading={false}
        isPlaying={false}
        onOpenArtist={jest.fn()}
        onPlay={jest.fn()}
        onSupport={onSupport}
      />
    );
    expect(screen.getByText("This is for supporters")).toBeTruthy();
    expect(
      screen.getByText("The note on this release stays hidden.")
    ).toBeTruthy();
    expect(screen.queryByText("Recorded in Accra.")).toBeNull();
    expect(screen.queryByLabelText("Play Night Mix")).toBeNull();
    fireEvent.press(screen.getByLabelText("Support Amaara Mensah"));
    expect(onSupport).toHaveBeenCalledTimes(1);
  });
});
