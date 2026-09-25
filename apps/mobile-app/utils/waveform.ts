export const WAVEFORM_HEIGHT = 56;
export const FEED_WAVEFORM_HEIGHT = 36;
export const WAVEFORM_BARS = 48;

/** Each bar is centered on the midline. Height grows up and down together. */
export function centeredBarLayout(
  amplitude: number,
  trackHeight = WAVEFORM_HEIGHT
): { top: number; height: number } {
  const clamped = Math.min(1, Math.max(0, amplitude));
  const height = Math.max(3, Math.round(clamped * trackHeight));
  return { height, top: (trackHeight - height) / 2 };
}

/** Collapse a long peaks array into the bars that fit on screen. */
export function samplePeaks(
  peaks: number[],
  barCount = WAVEFORM_BARS
): number[] {
  if (barCount <= 0) {
    return [];
  }
  if (peaks.length === 0) {
    return Array.from({ length: barCount }, (_, index) => {
      const wave = Math.sin((index / barCount) * Math.PI * 4);
      return 0.35 + Math.abs(wave) * 0.4;
    });
  }
  return Array.from({ length: barCount }, (_, index) => {
    const start = Math.floor((index * peaks.length) / barCount);
    const end = Math.max(
      start + 1,
      Math.floor(((index + 1) * peaks.length) / barCount)
    );
    let max = 0;
    for (let sample = start; sample < end; sample += 1) {
      const value = peaks[sample] ?? 0;
      if (value > max) {
        max = value;
      }
    }
    return max;
  });
}
