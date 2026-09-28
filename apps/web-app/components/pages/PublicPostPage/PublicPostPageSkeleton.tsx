"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const PublicPostPageSkeleton: React.FC = () => {
  return (
    <main
      className="mx-auto max-w-[720px] space-y-8 px-4 py-10 sm:px-8 lg:px-10"
      aria-busy
      aria-label="Loading post"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </main>
  );
};

export default PublicPostPageSkeleton;
