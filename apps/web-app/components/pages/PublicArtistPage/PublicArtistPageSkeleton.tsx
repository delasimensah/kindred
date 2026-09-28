"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const PublicArtistPageSkeleton: React.FC = () => {
  return (
    <div aria-busy aria-label="Loading artist">
      <div className="relative h-64 w-full sm:h-72 lg:h-[340px]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-8 lg:px-10">
        <Skeleton className="mb-10 h-4 w-full max-w-xl rounded" />
        <Skeleton className="mb-5 h-5 w-24 rounded" />
        <div className="rounded-2xl border border-white/5 bg-surface">
          <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicArtistPageSkeleton;
