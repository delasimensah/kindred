"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const ReleaseRowSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-4">
        <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 max-w-full rounded" />
          <Skeleton className="h-3 w-56 max-w-full rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-14 rounded-lg" />
        <Skeleton className="h-8 w-14 rounded-lg" />
      </div>
    </div>
  );
};

/** Matches the Releases list rows while data loads. */
const ReleasesPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading releases">
      <ReleaseRowSkeleton />
      <ReleaseRowSkeleton />
      <ReleaseRowSkeleton />
      <ReleaseRowSkeleton />
    </div>
  );
};

export default ReleasesPageSkeleton;
