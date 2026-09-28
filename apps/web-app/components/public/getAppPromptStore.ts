"use client";

import { create } from "zustand";

interface GetAppPromptState {
  open: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
}

export const useGetAppPrompt = create<GetAppPromptState>((set) => ({
  open: false,
  openPrompt: () => set({ open: true }),
  closePrompt: () => set({ open: false }),
}));
