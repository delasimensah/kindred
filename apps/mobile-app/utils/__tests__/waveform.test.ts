import { centeredBarLayout, samplePeaks, WAVEFORM_HEIGHT } from "../waveform";

describe("waveform", () => {
  it("centers every bar on the midline", () => {
    for (const amplitude of [0, 0.25, 0.5, 1]) {
      const bar = centeredBarLayout(amplitude, WAVEFORM_HEIGHT);
      expect(bar.top + bar.height / 2).toBe(WAVEFORM_HEIGHT / 2);
    }
  });

  it("samples a long peaks array down to the bars on screen", () => {
    const peaks = Array.from({ length: 1000 }, (_, index) => index / 1000);
    const bars = samplePeaks(peaks, 48);
    expect(bars).toHaveLength(48);
    expect(bars[0]).toBeLessThan(bars[47] ?? 0);
  });
});
