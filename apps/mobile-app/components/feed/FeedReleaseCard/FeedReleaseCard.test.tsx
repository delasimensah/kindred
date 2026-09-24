import { fireEvent, render, screen } from "@testing-library/react-native";

import FeedReleaseCard from "./FeedReleaseCard";

describe("FeedReleaseCard", () => {
  it("plays a public release and locks a supporters-only one", () => {
    const onPlay = jest.fn();
    const onSupport = jest.fn();
    const { rerender } = render(
      <FeedReleaseCard
        artistName="Amaara Mensah"
        avatarUrl={null}
        meta="2h ago · New release"
        title="Asase"
        artworkUrl={null}
        durationMs={201000}
        locked={false}
        isPlaying={false}
        onOpenArtist={jest.fn()}
        onPlay={onPlay}
        onSupport={onSupport}
      />
    );
    expect(screen.getByText("3:21")).toBeTruthy();
    expect(screen.getAllByText("Amaara Mensah")).toHaveLength(1);
    fireEvent.press(screen.getByLabelText("Play Asase"));
    expect(onPlay).toHaveBeenCalledTimes(1);

    rerender(
      <FeedReleaseCard
        artistName="Amaara Mensah"
        avatarUrl={null}
        meta="2h ago · New release"
        title="Night Mix"
        artworkUrl={null}
        durationMs={180000}
        locked
        isPlaying={false}
        onOpenArtist={jest.fn()}
        onPlay={onPlay}
        onSupport={onSupport}
      />
    );
    fireEvent.press(screen.getByLabelText("Support Amaara Mensah to unlock"));
    expect(onSupport).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});
