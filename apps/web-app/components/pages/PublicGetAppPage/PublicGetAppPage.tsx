"use client";

import {
  IconBrandApple,
  IconBrandGooglePlay,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";

import { ASSETS } from "@/constants";

import Heading from "../../ui/Heading/Heading";

const PublicGetAppPage: React.FC = () => {
  const router = useRouter();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="relative w-full max-w-[480px] rounded-3xl border border-white/10 bg-surface p-7 text-center shadow-2xl sm:p-9">
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => router.back()}
          className="absolute right-5 top-5 text-text/35 hover:text-text/70"
        >
          <IconX size={16} />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSETS.icons.logo}
          alt=""
          width={80}
          height={80}
          className="mx-auto mb-6 h-20 w-20 rounded-2xl"
        />

        <Heading
          variant="page"
          className="mb-2.5 font-display text-2xl font-medium leading-tight"
        >
          Listen with the full Kindred app
        </Heading>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-relaxed text-text/60">
          Unlock offline downloads, exclusive posts, and the full listening
          experience by Amaara Mensah and every artist you follow.
        </p>

        <button
          type="button"
          className="mb-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-textOnPrimary hover:brightness-95"
        >
          Open app
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-page px-4 py-2.5 hover:bg-white/5"
          >
            <IconBrandApple size={22} className="text-text" aria-hidden />
            <span className="text-left leading-none">
              <span className="block text-[9px] text-text/50">
                Download on the
              </span>
              <span className="mt-0.5 block text-xs font-semibold text-text">
                App Store
              </span>
            </span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-page px-4 py-2.5 hover:bg-white/5"
          >
            <IconBrandGooglePlay size={18} className="text-text" aria-hidden />
            <span className="text-left leading-none">
              <span className="block text-[9px] text-text/50">Get it on</span>
              <span className="mt-0.5 block text-xs font-semibold text-text">
                Google Play
              </span>
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-text/40 underline hover:text-text/70"
        >
          Continue in browser
        </button>
      </div>
    </main>
  );
};

export default PublicGetAppPage;
