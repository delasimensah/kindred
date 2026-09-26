"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

/** Matches Fans to thank header + ranked rows while data loads. */
const StudioThankYousPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading fans to thank"
    >
      <div className="mb-9 space-y-3">
        <Skeleton className="h-3 w-40 rounded" />
        <Skeleton className="h-10 w-56 max-w-full rounded sm:h-12 sm:w-72" />
        <Skeleton className="h-4 w-full max-w-xl rounded" />
        <Skeleton className="h-4 w-64 max-w-full rounded" />
      </div>

      <ul className="max-w-[860px] space-y-3">
        {[0, 1, 2, 3].map((key) => (
          <li
            key={key}
            className={
              key === 0
                ? "flex flex-col gap-4 rounded-2xl border border-primary/30 bg-surface p-5 sm:flex-row sm:items-start"
                : "flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface p-5 sm:flex-row sm:items-start"
            }
          >
            <Skeleton className="mt-1 h-8 w-8 shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
                {key < 2 ? (
                  <Skeleton className="h-5 w-20 rounded-full" />
                ) : null}
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <Skeleton className="mt-1 h-10 w-full shrink-0 rounded-xl sm:w-36" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudioThankYousPageSkeleton;
