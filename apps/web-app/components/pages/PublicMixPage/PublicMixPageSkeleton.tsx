"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const PublicMixPageSkeleton: React.FC = () => {
  return (
    <main
      className="mx-auto max-w-[900px] px-4 py-10 sm:px-8 lg:px-10"
      aria-busy
      aria-label="Loading mix"
    >
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
        <Skeleton className="h-48 w-48 rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-9 w-56 max-w-full rounded" />
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>
      <Skeleton className="mb-5 h-5 w-24 rounded" />
      <div className="rounded-2xl border border-white/5 bg-surface px-4 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
      </div>
    </main>
  );
};

export default PublicMixPageSkeleton;
