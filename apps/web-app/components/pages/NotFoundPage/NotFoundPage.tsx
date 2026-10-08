import Link from "next/link";
import React from "react";

import { ASSETS } from "@/constants";

const NotFoundPage: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-6 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.icons.logo}
        alt=""
        width={48}
        height={48}
        className="mb-4 h-12 w-12 rounded-xl"
      />
      <p className="font-display text-lg tracking-tight text-text">Kindred</p>
      <h1 className="mt-10 max-w-md font-display text-[32px] font-medium leading-tight text-text sm:text-4xl">
        This page isn&apos;t here
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text/60">
        Nothing on Kindred uses this address.
      </p>
      <Link
        href="/browse"
        className="mt-8 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95"
      >
        Browse Kindred
      </Link>
      <Link
        href="/sign-in"
        className="mt-4 text-sm font-medium text-text/60 hover:text-text"
      >
        Artist studio
      </Link>
    </main>
  );
};

export default NotFoundPage;
