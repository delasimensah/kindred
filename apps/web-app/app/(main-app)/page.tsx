"use client";

import React from "react";

import { StudioHomePlaceholder } from "@/components";
import { useStudioSession } from "@/hooks";

const HomeRoute = () => {
  const session = useStudioSession();

  return (
    <StudioHomePlaceholder
      displayName={session.displayName}
      isAdmin={session.isAdmin}
      onSignOut={session.handleSignOut}
      isSigningOut={session.isSigningOut}
    />
  );
};

export default HomeRoute;
