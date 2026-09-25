"use client";

import React from "react";

import { useStudioSession } from "@/hooks";

import NotAllowedPage from "../../pages/NotAllowedPage/NotAllowedPage";
import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";

interface StudioGateProps {
  children: React.ReactNode;
}

const StudioGate: React.FC<StudioGateProps> = ({ children }) => {
  const session = useStudioSession();

  if (session.isSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session.canAccessStudio) {
    return (
      <NotAllowedPage
        onSignOut={session.handleSignOut}
        isSigningOut={session.isSigningOut}
      />
    );
  }

  return <>{children}</>;
};

export default StudioGate;
