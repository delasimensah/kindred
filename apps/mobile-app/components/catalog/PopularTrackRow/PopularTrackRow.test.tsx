import { fireEvent, render, screen } from "@testing-library/react-native";

import PopularTrackRow from "./PopularTrackRow";

describe("PopularTrackRow", () => {
  it("plays a public track and opens a locked one", () => {
    const onPlay = jest.fn();
    const onOpenLocked = jest.fn();
    const { rerender } = render(
      <PopularTrackRow
        trackId="track_asase"
        title="Asase"
        subtitle="3:32"
        artworkUrl={null}
        locked={false}
        isPlaying={false}
        onPlay={onPlay}
        onOpenLocked={onOpenLocked}
      />
    );
    fireEvent.press(screen.getByLabelText("Play Asase"));
    expect(onPlay).toHaveBeenCalledTimes(1);

    rerender(
      <PopularTrackRow
        trackId="track_night"
        title="Night Mix"
        subtitle="Supporters only"
        artworkUrl={null}
        locked
        isPlaying={false}
        onPlay={onPlay}
        onOpenLocked={onOpenLocked}
      />
    );
    fireEvent.press(screen.getByLabelText("Night Mix, supporters only"));
    expect(onOpenLocked).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});
