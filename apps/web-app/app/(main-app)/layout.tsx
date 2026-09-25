"use client";

import React from "react";

import { StudioAppShell, StudioGate } from "@/components";
import { StudioSessionProvider } from "@/hooks";

const MainAppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <StudioSessionProvider>
      <StudioGate>
        <StudioAppShell>{children}</StudioAppShell>
      </StudioGate>
    </StudioSessionProvider>
  );
};

export default MainAppLayout;
