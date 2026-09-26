/**
 * Waveform buckets on every track. Length is fixed so later screens can draw
 * without knowing the audio duration.
 */
export const TRACK_PEAK_BUCKETS = 1000;

/**
 * Waveform buckets on voice-note updates. Shorter than tracks — matches seed.
 */
export const VOICE_PEAK_BUCKETS = 48;
