"use client";

import Link from "next/link";
import React from "react";

import { ASSETS } from "@/constants";

import GetTheAppButton from "./GetTheAppButton";
import PublicGetAppModal from "./PublicGetAppModal";
import PublicPlayer from "./PublicPlayer";
import { usePublicPlayer } from "./publicPlayerStore";
import PublicStudioLink from "./PublicStudioLink";

const PublicShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const playerOpen = usePublicPlayer((state) => state.queue.length > 0);
  return (
    <div className="min-h-screen bg-page text-text">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-page/95 px-4 backdrop-blur sm:px-8 lg:px-10">
        <Link href="/browse" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.icons.logo}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg"
          />
          <span className="font-display text-lg tracking-tight text-text">
            Kindred
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <PublicStudioLink />
          <GetTheAppButton
            iconSize={14}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-textOnPrimary hover:brightness-95 sm:px-5"
          />
        </div>
      </header>
      <div className={playerOpen ? "pb-24 md:pb-28" : ""}>{children}</div>
      <PublicPlayer />
      <PublicGetAppModal />
    </div>
  );
};

export default PublicShell;
