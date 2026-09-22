import { TRACK_PEAK_BUCKETS } from "./tracks";

/** Max absolute amplitude in each slice, then scaled so the loudest slice is 1. */
export function bucketPeaks(
  samples: ArrayLike<number>,
  bucketCount = TRACK_PEAK_BUCKETS
): number[] {
  const peaks = new Array<number>(bucketCount).fill(0);
  if (samples.length === 0) {
    return peaks;
  }
  const size = samples.length / bucketCount;
  let max = 0;
  for (let index = 0; index < bucketCount; index += 1) {
    const start = Math.floor(index * size);
    const end = Math.min(samples.length, Math.floor((index + 1) * size));
    let peak = 0;
    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      const value = Math.abs(samples[sampleIndex] ?? 0);
      if (value > peak) {
        peak = value;
      }
    }
    peaks[index] = peak;
    if (peak > max) {
      max = peak;
    }
  }
  if (max === 0) {
    return peaks;
  }
  return peaks.map((peak) => Math.round((peak / max) * 1000) / 1000);
}
