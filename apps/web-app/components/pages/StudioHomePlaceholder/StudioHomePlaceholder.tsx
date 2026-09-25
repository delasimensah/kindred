"use client";

import { Button } from "@mantine/core";
import React from "react";

import StudioWordmark from "../../auth/StudioWordmark/StudioWordmark";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

interface StudioHomePlaceholderProps {
  displayName: string;
  isAdmin: boolean;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * Signed-in landing until KIND-78 ships Studio home.
 * Proves KIND-45: artist/admin reached Studio after sign-in.
 */
const StudioHomePlaceholder: React.FC<StudioHomePlaceholderProps> = ({
  displayName,
  isAdmin,
  onSignOut,
  isSigningOut = false,
}) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-page px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white/5 bg-surface px-6 py-10 shadow-2xl sm:px-10 sm:py-11">
        <StudioWordmark />
        <Heading
          variant="section"
          className="mb-2 text-center text-xl font-semibold text-text"
        >
          You&apos;re signed in
        </Heading>
        <Text className="text-center text-sm text-text/60">
          {displayName}
          {isAdmin ? " · Admin" : " · Artist"}
        </Text>
        <Text className="mt-4 text-center text-sm text-text/40">
          Studio home and uploads land in the next web tickets.
        </Text>
        <Button
          onClick={onSignOut}
          loading={isSigningOut}
          variant="default"
          className="mt-8 h-auto w-full rounded-xl border-white/10 bg-page py-3.5 text-sm font-semibold text-text hover:bg-page/80"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default StudioHomePlaceholder;
