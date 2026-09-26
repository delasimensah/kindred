import { TRACK_PEAK_BUCKETS, VOICE_PEAK_BUCKETS } from "../catalog";

describe("catalog constants", () => {
  it("fixes waveform peaks at 1000 buckets", () => {
    expect(TRACK_PEAK_BUCKETS).toBe(1000);
  });

  it("fixes voice-note peaks at 48 buckets", () => {
    expect(VOICE_PEAK_BUCKETS).toBe(48);
  });
});
