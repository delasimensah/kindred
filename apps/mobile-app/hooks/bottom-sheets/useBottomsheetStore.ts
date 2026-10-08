import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { type RefObject } from "react";
import { create } from "zustand";

/**
 * Manages bottom sheet refs and imperative open methods.
 */
interface BottomsheetState {
  setGenericRef: (ref: RefObject<BottomSheetModal | null> | null) => void;
  setQueueRef: (ref: RefObject<BottomSheetModal | null> | null) => void;
  setQueueSheetOpen: (open: boolean) => void;
  openGenericSheet: () => void;
  openQueueSheet: () => void;
  closeQueueSheet: () => void;
  genericRef: RefObject<BottomSheetModal | null> | null;
  queueRef: RefObject<BottomSheetModal | null> | null;
  /** True only while the queue sheet is actually on screen. */
  queueSheetOpen: boolean;
}

export const useBottomsheetStore = create<BottomsheetState>((set, get) => ({
  genericRef: null,
  queueRef: null,
  queueSheetOpen: false,

  setGenericRef: (ref) => set({ genericRef: ref }),
  setQueueRef: (ref) => set({ queueRef: ref }),
  setQueueSheetOpen: (open) => set({ queueSheetOpen: open }),

  openGenericSheet: () => {
    get().genericRef?.current?.present();
  },

  openQueueSheet: () => {
    get().queueRef?.current?.present();
  },

  closeQueueSheet: () => {
    if (!get().queueSheetOpen) {
      return;
    }
    get().queueRef?.current?.dismiss();
  },
}));
