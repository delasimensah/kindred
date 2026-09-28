"use client";

import React, { useEffect } from "react";

import PublicGetAppPage from "../pages/PublicGetAppPage/PublicGetAppPage";
import { useGetAppPrompt } from "./getAppPromptStore";

const PublicGetAppModal: React.FC = () => {
  const open = useGetAppPrompt((state) => state.open);
  const closePrompt = useGetAppPrompt((state) => state.closePrompt);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePrompt();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closePrompt]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10 sm:px-6">
      <button
        type="button"
        aria-label="Close install prompt"
        onClick={closePrompt}
        className="absolute inset-0 bg-page/70"
      />
      <PublicGetAppPage onClose={closePrompt} />
    </div>
  );
};

export default PublicGetAppModal;
