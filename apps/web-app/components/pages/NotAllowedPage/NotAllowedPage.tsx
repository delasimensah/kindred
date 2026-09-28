"use client";

import { Button } from "@mantine/core";
import React from "react";

import StudioWordmark from "../../auth/StudioWordmark/StudioWordmark";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

interface NotAllowedPageProps {
  onSignOut: () => void;
  isSigningOut?: boolean;
  title?: string;
  body?: string;
}

const NotAllowedPage: React.FC<NotAllowedPageProps> = ({
  onSignOut,
  isSigningOut = false,
  title = "This account cannot use Artist Studio",
  body = "Artist Studio and admin are for verified artists and admins only. Fan accounts stay on the Kindred mobile app. If you requested studio access, wait for approval, then sign in again here.",
}) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-page px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white/5 bg-surface px-6 py-10 text-center shadow-2xl sm:px-10 sm:py-11">
        <StudioWordmark />
        <Heading
          variant="section"
          className="mb-3 text-xl font-semibold text-text sm:text-2xl"
        >
          {title}
        </Heading>
        <Text className="text-sm leading-relaxed text-text/60">{body}</Text>
        <Button
          onClick={onSignOut}
          loading={isSigningOut}
          className="mt-8 h-auto rounded-xl bg-primary px-10 py-3.5 text-sm font-semibold text-textOnPrimary hover:brightness-95"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default NotAllowedPage;
