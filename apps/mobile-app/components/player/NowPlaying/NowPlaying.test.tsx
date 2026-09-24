import { render, screen } from "@testing-library/react-native";

import type { QueueTrack } from "@/hooks";

import NowPlaying from "./NowPlaying";

jest.mock("convex/react", () => ({
  useQuery: () => false,
  useMutation: () => jest.fn(),
}));

const track: QueueTrack = {
  trackId: "tr_asase",
  title: "Asase",
  artistName: "Amaara Mensah",
  artistId: "ar_amaara",
  artworkUrl: null,
  durationMs: 180000,
  locked: false,
  peaks: [],
  source: "library",
};

describe("NowPlaying", () => {
  it("shows the current track", () => {
    render(
      <NowPlaying
        track={track}
        isPlaying={false}
        shuffle={false}
        repeat="off"
        progress={0}
        positionMs={0}
        durationMs={180000}
        onClose={jest.fn()}
        onToggle={jest.fn()}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
        onSeek={jest.fn()}
        onShuffle={jest.fn()}
        onRepeat={jest.fn()}
        onQueue={jest.fn()}
        onPlayNext={jest.fn()}
        onAddToQueue={jest.fn()}
      />
    );
    expect(screen.getAllByText("Asase").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Queue")).toBeTruthy();
  });
});
