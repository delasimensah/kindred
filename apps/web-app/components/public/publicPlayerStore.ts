"use client";

import { create } from "zustand";

export interface PublicQueueItem {
  kind: "track" | "voice";
  id: string;
  title: string;
  artistName: string;
  artworkUrl: string | null;
  durationMs: number;
}

interface PublicPlayerState {
  queue: PublicQueueItem[];
  index: number;
  playing: boolean;
  positionMs: number;
  generation: number;
  play: (queue: PublicQueueItem[], index: number) => void;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setPosition: (positionMs: number) => void;
}

export const usePublicPlayer = create<PublicPlayerState>((set, get) => ({
  queue: [],
  index: 0,
  playing: false,
  positionMs: 0,
  generation: 0,
  play: (queue, index) => {
    if (queue.length === 0 || queue[index] === undefined) {
      return;
    }
    set({
      queue,
      index,
      playing: true,
      positionMs: 0,
      generation: get().generation + 1,
    });
  },
  toggle: () => set({ playing: !get().playing }),
  pause: () => set({ playing: false }),
  next: () => {
    const { index, queue, generation } = get();
    if (index < queue.length - 1) {
      set({
        index: index + 1,
        positionMs: 0,
        playing: true,
        generation: generation + 1,
      });
      return;
    }
    set({ playing: false });
  },
  previous: () => {
    const { index, generation } = get();
    if (index > 0) {
      set({
        index: index - 1,
        positionMs: 0,
        playing: true,
        generation: generation + 1,
      });
      return;
    }
    set({ positionMs: 0, generation: generation + 1 });
  },
  setPosition: (positionMs) => set({ positionMs }),
}));
