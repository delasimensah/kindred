"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const StudioProfilePageSkeleton: React.FC = () => {
  return (
    <div className="px-4 py-8 sm:px-8 lg:px-10">
      <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-64 max-w-full rounded" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="px-6 py-3">
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
          <div className="space-y-5 rounded-2xl border border-white/5 bg-surface p-7">
            <Skeleton className="h-4 w-24 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-surface p-7">
            <Skeleton className="mb-5 h-4 w-20 rounded" />
            <div className="flex flex-col items-center">
              <Skeleton className="mb-4 h-28 w-28 rounded-full" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/5 bg-surface p-7">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioProfilePageSkeleton;
