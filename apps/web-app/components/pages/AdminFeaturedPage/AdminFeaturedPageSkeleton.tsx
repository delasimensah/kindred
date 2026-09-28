"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

/** Matches the featured header and one filled slot. */
const AdminFeaturedPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading featured slots"
    >
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 max-w-full rounded" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>
      <div className="max-w-3xl rounded-2xl border border-white/5 bg-surface px-4 py-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeaturedPageSkeleton;
