import { render, screen } from "@testing-library/react-native";

import type { QueueTrack } from "@/hooks";

import NowPlayingRow from "./NowPlayingRow";

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

describe("NowPlayingRow", () => {
  it("shows the track that is playing", () => {
    render(<NowPlayingRow track={track} isPlaying />);
    expect(screen.getByText("Asase")).toBeTruthy();
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
  });
});
