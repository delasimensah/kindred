"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const ROW_COLS =
  "grid grid-cols-[minmax(0,1fr)_5.75rem_5.5rem] items-center gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_13.75rem_10rem] sm:gap-4 sm:px-6";

/** Matches Supporters header summary cards + table while data loads. */
const StudioSupportersPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading supporters"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 max-w-full rounded" />
          <Skeleton className="h-4 w-72 max-w-full rounded" />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-3">
            <Skeleton className="mb-2 h-3 w-24 rounded" />
            <Skeleton className="ml-auto h-6 w-10 rounded" />
          </div>
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-3">
            <Skeleton className="mb-2 h-3 w-28 rounded" />
            <Skeleton className="ml-auto h-6 w-8 rounded" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
        <div className={`${ROW_COLS} border-b border-white/5 py-3`}>
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <ul className="divide-y divide-white/5">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <li key={key} className={ROW_COLS}>
              <Skeleton className="h-4 w-36 max-w-full rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudioSupportersPageSkeleton;
