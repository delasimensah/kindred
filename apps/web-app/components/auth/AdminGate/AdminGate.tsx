"use client";

import React from "react";

import { useStudioSession } from "@/hooks";

import NotAllowedPage from "../../pages/NotAllowedPage/NotAllowedPage";
import LoadingScreen from "../../shared/LoadingScreen/LoadingScreen";

interface AdminGateProps {
  children: React.ReactNode;
}

const AdminGate: React.FC<AdminGateProps> = ({ children }) => {
  const session = useStudioSession();

  if (session.isSessionLoading) {
    return <LoadingScreen />;
  }

  if (!session.isAdmin) {
    return (
      <NotAllowedPage
        title="Admin only"
        body="Requests and the artist list are for the Kindred admin. Artist Studio stays in the sidebar for a verified artist."
        onSignOut={session.handleSignOut}
        isSigningOut={session.isSigningOut}
      />
    );
  }

  return <>{children}</>;
};

export default AdminGate;
