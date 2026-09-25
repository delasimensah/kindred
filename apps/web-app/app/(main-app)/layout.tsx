"use client";

import React from "react";

import { StudioGate } from "@/components";
import { StudioSessionProvider } from "@/hooks";

const MainAppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <StudioSessionProvider>
      <StudioGate>{children}</StudioGate>
    </StudioSessionProvider>
  );
};

export default MainAppLayout;
