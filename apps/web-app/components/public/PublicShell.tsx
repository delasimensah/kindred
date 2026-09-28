"use client";

import { IconDeviceMobile } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { ASSETS } from "@/constants";

import PublicPlayer from "./PublicPlayer";
import { usePublicPlayer } from "./publicPlayerStore";

const PublicShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const playerOpen = usePublicPlayer((state) => state.queue.length > 0);
  return (
    <div className="min-h-screen bg-page text-text">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-page/95 px-4 backdrop-blur sm:px-8 lg:px-10">
        <div className="flex items-center gap-2.5">
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
        </div>
        <Link
          href="/get-the-app"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-textOnPrimary hover:brightness-95 sm:px-5"
        >
          <IconDeviceMobile size={14} aria-hidden />
          Get the app
        </Link>
      </header>
      <div className={playerOpen ? "pb-40" : ""}>{children}</div>
      <PublicPlayer />
    </div>
  );
};

export default PublicShell;
