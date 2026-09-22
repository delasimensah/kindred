import { describe, expect, it } from "vitest";

import { bucketPeaks } from "./peaks";
import { TRACK_PEAK_BUCKETS } from "./tracks";

describe("bucketPeaks", () => {
  it("returns 1000 zeros for silence", () => {
    const peaks = bucketPeaks(new Float32Array(4000));
    expect(peaks).toHaveLength(TRACK_PEAK_BUCKETS);
    expect(peaks.every((peak) => peak === 0)).toBe(true);
  });

  it("scales the loudest bucket to 1", () => {
    const samples = new Float32Array(TRACK_PEAK_BUCKETS);
    samples[samples.length - 1] = 0.4;
    const peaks = bucketPeaks(samples);
    expect(peaks[0]).toBe(0);
    expect(peaks[peaks.length - 1]).toBe(1);
    expect(peaks.every((peak) => peak >= 0 && peak <= 1)).toBe(true);
  });
});
