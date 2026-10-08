"use client";

import React from "react";

import Heading from "../../ui/Heading/Heading";
import Skeleton from "../../ui/Skeleton/Skeleton";

const PublicArtistPageSkeleton: React.FC = () => {
  return (
    <div aria-busy aria-label="Loading artist">
      <div className="relative h-80 w-full bg-surface md:h-72 lg:h-[340px]">
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1100px] flex-col gap-4 px-4 pb-6 sm:px-8 md:flex-row md:items-end md:gap-6 lg:px-10 lg:pb-8">
          <Skeleton className="h-20 w-20 rounded-full sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
          <div className="min-w-0 flex-1 space-y-2 pb-1">
            <Skeleton className="h-9 w-56 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 lg:px-10">
        <Heading variant="section" className="mb-5 text-lg font-semibold">
          Popular tracks
        </Heading>
        <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-surface">
          {["a", "b", "c"].map((key) => (
            <div
              key={key}
              className="flex items-center gap-4 px-4 py-4 sm:px-6"
            >
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicArtistPageSkeleton;
