import { render, screen } from "@testing-library/react-native";

import WaveformScrubber from "./WaveformScrubber";

describe("WaveformScrubber", () => {
  it("shows the waveform", () => {
    render(<WaveformScrubber peaks={[]} progress={0} onSeek={jest.fn()} />);
    expect(screen.getByLabelText("Waveform")).toBeTruthy();
  });
});
