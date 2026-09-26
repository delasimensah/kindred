"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const StudioHomePageSkeleton: React.FC = () => {
  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 max-w-full rounded" />
          <Skeleton className="h-4 w-72 max-w-full rounded" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-white/5 bg-surface p-6"
          >
            <Skeleton className="mb-4 h-4 w-24 rounded" />
            <Skeleton className="mb-3 h-8 w-16 rounded" />
            <Skeleton className="h-3 w-40 max-w-full rounded" />
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="overflow-hidden rounded-2xl border border-white/5 bg-surface"
          >
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudioHomePageSkeleton;
