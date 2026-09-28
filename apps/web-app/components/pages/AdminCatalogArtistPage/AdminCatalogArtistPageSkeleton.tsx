"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

/** Matches the artist header and one release block. */
const AdminCatalogArtistPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading artist catalog"
    >
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-3 w-14 rounded" />
        <Skeleton className="h-3 w-2 rounded" />
        <Skeleton className="h-3 w-28 rounded" />
      </div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <Skeleton className="mb-2 h-4 w-28 rounded" />
      <Skeleton className="mb-3 h-3 w-64 max-w-full rounded" />
      <div className="rounded-2xl border border-white/5 bg-surface px-4 py-4 sm:px-6">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
        <Skeleton className="h-3 w-36 rounded" />
      </div>
    </div>
  );
};

export default AdminCatalogArtistPageSkeleton;
