import { TRACK_PEAK_BUCKETS, VOICE_PEAK_BUCKETS } from "shared";

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

async function decodePeaks(
  file: File,
  bucketCount: number
): Promise<{ peaks: number[]; durationMs: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const context = new AudioCtx();
  try {
    const buffer = await context.decodeAudioData(arrayBuffer.slice(0));
    const channel = buffer.getChannelData(0);
    return {
      peaks: bucketPeaks(channel, bucketCount),
      durationMs: Math.max(1, Math.round(buffer.duration * 1000)),
    };
  } finally {
    await context.close();
  }
}

/**
 * Decode an audio file in the browser and build the 1000-bucket peaks array
 * the scrubber expects (same shape as seed peaks).
 */
export async function generatePeaksFromAudioFile(file: File): Promise<{
  peaks: number[];
  durationMs: number;
}> {
  return await decodePeaks(file, TRACK_PEAK_BUCKETS);
}

/** Decode a voice note and build the 48-bucket peaks array (same as seed). */
export async function generateVoicePeaksFromAudioFile(file: File): Promise<{
  peaks: number[];
  durationMs: number;
}> {
  return await decodePeaks(file, VOICE_PEAK_BUCKETS);
}
