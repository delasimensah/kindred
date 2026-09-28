"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

/** Matches the requests header, three counts, and a request row. */
const AdminRequestsPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading artist requests"
    >
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full rounded" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl lg:w-72" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="space-y-3 rounded-2xl border border-white/5 bg-surface p-6">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-3 w-56 rounded" />
        <Skeleton className="h-12 w-full rounded" />
      </div>
    </div>
  );
};

export default AdminRequestsPageSkeleton;
