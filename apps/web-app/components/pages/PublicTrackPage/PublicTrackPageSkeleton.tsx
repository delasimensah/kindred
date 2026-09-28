"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const PublicTrackPageSkeleton: React.FC = () => {
  return (
    <main
      className="mx-auto max-w-[1000px] px-4 py-10 sm:px-8 lg:px-10 lg:py-14"
      aria-busy
      aria-label="Loading track"
    >
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center">
        <Skeleton className="h-52 w-52 rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-10 w-64 max-w-full rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
    </main>
  );
};

export default PublicTrackPageSkeleton;
