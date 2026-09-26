"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const UpdatesPageSkeleton: React.FC = () => {
  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-40 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl sm:w-44" />
      </div>
      <div className="max-w-[820px] space-y-4">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-white/5 bg-surface p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="mb-2 h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdatesPageSkeleton;
