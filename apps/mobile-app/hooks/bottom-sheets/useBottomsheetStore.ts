import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { type RefObject } from "react";
import { create } from "zustand";

/**
 * Manages bottom sheet refs and imperative open methods.
 */
interface BottomsheetState {
  setGenericRef: (ref: RefObject<BottomSheetModal | null> | null) => void;
  setQueueRef: (ref: RefObject<BottomSheetModal | null> | null) => void;
  openGenericSheet: () => void;
  openQueueSheet: () => void;
  closeQueueSheet: () => void;
  genericRef: RefObject<BottomSheetModal | null> | null;
  queueRef: RefObject<BottomSheetModal | null> | null;
}

export const useBottomsheetStore = create<BottomsheetState>((set, get) => ({
  genericRef: null,
  queueRef: null,

  setGenericRef: (ref) => set({ genericRef: ref }),
  setQueueRef: (ref) => set({ queueRef: ref }),

  openGenericSheet: () => {
    get().genericRef?.current?.present();
  },

  openQueueSheet: () => {
    get().queueRef?.current?.present();
  },

  closeQueueSheet: () => {
    get().queueRef?.current?.dismiss();
  },
}));
