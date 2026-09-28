"use client";

import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";

const PublicBrowsePageSkeleton: React.FC = () => {
  return (
    <main
      aria-busy
      aria-label="Loading browse"
      className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 lg:px-10 lg:py-9"
    >
      <Skeleton className="mb-5 h-5 w-24 rounded" />
      <Skeleton className="mb-11 h-64 w-full rounded-2xl" />
      <Skeleton className="mb-5 h-5 w-20 rounded" />
      <div className="mb-11 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton key={key} className="h-52 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
    </main>
  );
};

export default PublicBrowsePageSkeleton;
