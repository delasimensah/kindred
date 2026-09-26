"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

/** Matches Earnings hero, metrics, how-it-works, chart, and month table. */
const StudioEarningsPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading earnings"
    >
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-36 rounded" />
        <Skeleton className="h-4 w-80 max-w-full rounded" />
      </div>

      <div className="mb-6 rounded-2xl border border-white/5 bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-12 w-48 max-w-full rounded sm:h-14" />
            <Skeleton className="h-4 w-64 max-w-full rounded" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-3 w-20 rounded" />
            <Skeleton className="ml-auto h-4 w-14 rounded" />
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-5 sm:grid-cols-2">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-white/5 bg-surface px-6 py-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="mb-3 h-8 w-28 rounded" />
            <Skeleton className="h-3 w-48 max-w-full rounded" />
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-5 w-40 rounded" />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex gap-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-3 w-40 max-w-[40%] rounded" />
        </div>
        <div className="flex h-48 items-end gap-3 sm:h-64 sm:gap-4">
          {[40, 65, 50, 80, 55, 90].map((height, index) => (
            <div
              key={index}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <Skeleton
                className="w-full max-w-[48px] rounded-t-md"
                height={`${height}%`}
              />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-center gap-2 border-b border-white/5 px-4 py-3 sm:grid-cols-[1fr_1fr_1fr] sm:px-6">
          <Skeleton className="h-3 w-14 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
        <ul className="divide-y divide-white/5">
          {[0, 1, 2, 3].map((key) => (
            <li
              key={key}
              className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-center gap-2 px-4 py-4 sm:grid-cols-[1fr_1fr_1fr] sm:px-6"
            >
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-10 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudioEarningsPageSkeleton;
