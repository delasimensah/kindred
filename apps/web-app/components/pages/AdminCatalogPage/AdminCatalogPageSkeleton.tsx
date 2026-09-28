"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

/** Matches the catalog header, the three ways in, and one artist row. */
const AdminCatalogPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading catalog"
    >
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl lg:w-72" />
      </div>
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-surface px-4 py-4 sm:px-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
};

export default AdminCatalogPageSkeleton;
