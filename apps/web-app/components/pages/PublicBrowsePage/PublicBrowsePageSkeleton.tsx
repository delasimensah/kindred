"use client";

import React from "react";

import GetTheAppButton from "../../public/GetTheAppButton";
import Heading from "../../ui/Heading/Heading";
import Skeleton from "../../ui/Skeleton/Skeleton";
import Text from "../../ui/Text/Text";

const PublicBrowsePageSkeleton: React.FC = () => {
  return (
    <main
      aria-busy
      aria-label="Loading browse"
      className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 lg:px-10 lg:py-9"
    >
      <Heading variant="section" className="mb-5 text-lg font-semibold">
        Featured
      </Heading>
      <div className="mb-11 grid overflow-hidden rounded-2xl bg-surface md:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
        <Skeleton className="h-80 w-full rounded-none md:h-[420px]" />
        <div className="flex flex-col justify-center px-5 py-6 sm:px-8">
          <Skeleton className="h-4 w-full max-w-sm rounded" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-xs rounded" />
          <div className="mt-5 divide-y divide-white/5">
            {["a", "b", "c"].map((key) => (
              <div key={key} className="flex items-center gap-3 py-2.5">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            ))}
          </div>
          <GetTheAppButton
            iconSize={14}
            className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-textOnPrimary"
          />
        </div>
      </div>
      <Heading variant="section" className="mb-5 text-lg font-semibold">
        Rising
      </Heading>
      <div className="mb-11 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-5">
        {["a", "b", "c", "d"].map((key) => (
          <div
            key={key}
            className="flex flex-col items-center rounded-2xl border border-white/5 bg-surface p-4 sm:p-5"
          >
            <Skeleton className="mb-4 h-20 w-20 rounded-full" />
            <Skeleton className="mb-2 h-4 w-24 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>
      <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/5 bg-surface px-6 py-8 sm:px-10 sm:py-9 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <Heading
            variant="section"
            className="mb-2 font-display text-2xl font-medium"
          >
            Get the full Kindred experience
          </Heading>
          <Text className="max-w-md text-sm leading-relaxed text-text/60">
            Offline downloads, exclusive posts and tracks, and support for every
            artist you love — all in the app.
          </Text>
        </div>
        <GetTheAppButton
          iconSize={14}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-textOnPrimary"
        />
      </section>
    </main>
  );
};

export default PublicBrowsePageSkeleton;
