import { render, screen } from "@testing-library/react-native";

import type { QueueTrack } from "@/hooks";

import QueuePanel from "./QueuePanel";

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

describe("QueuePanel", () => {
  it("shows the current track and the upcoming section", () => {
    render(
      <QueuePanel
        current={track}
        upcoming={[]}
        isPlaying
        shuffle={false}
        repeat="off"
        onShuffle={jest.fn()}
        onRepeat={jest.fn()}
        onRemove={jest.fn()}
        onMove={jest.fn()}
      />
    );
    expect(screen.getByText("Next up")).toBeTruthy();
    expect(screen.getByText("Asase")).toBeTruthy();
  });
});
