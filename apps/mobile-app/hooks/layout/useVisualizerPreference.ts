import { create } from "zustand";

interface VisualizerPreference {
  /** What the fan last chose. Low Power Mode can still keep the graphic off. */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Client-only. Starts off every launch, which is the now-playing default.
 */
export const useVisualizerPreference = create<VisualizerPreference>((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}));
