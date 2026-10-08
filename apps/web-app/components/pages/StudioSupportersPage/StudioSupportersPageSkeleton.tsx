"use client";

import React from "react";
import { FOUNDING_SUPPORTER_LIMIT } from "shared";

import Heading from "../../ui/Heading/Heading";
import Skeleton from "../../ui/Skeleton/Skeleton";
import Text from "../../ui/Text/Text";

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
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            Supporters
          </Heading>
          <Text className="mt-1.5 max-w-xl text-sm text-text/50">
            Everyone routing part of their plan to you. Founding is the first{" "}
            {FOUNDING_SUPPORTER_LIMIT} people to route to you. They keep that
            place, and they are first when you send thank-yous. After you thank
            them, the next person moves up.
          </Text>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-3 text-right">
            <p className="text-xs text-text/40">Total supporters</p>
            <Skeleton className="ml-auto mt-1 h-6 w-10 rounded" />
          </div>
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-3 text-right">
            <p className="text-xs text-text/40">Founding members</p>
            <Skeleton className="ml-auto mt-1 h-6 w-8 rounded" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
        <div
          className={`${ROW_COLS} border-b border-white/5 py-3 text-xs text-text/40`}
        >
          <span>Name</span>
          <span className="sm:hidden">Since</span>
          <span className="hidden sm:inline">Routing since</span>
          <span>Founding</span>
        </div>
        <ul className="divide-y divide-white/5">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <li key={key} className={ROW_COLS}>
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-36 max-w-full rounded" />
              </div>
              <Skeleton className="h-4 w-20 max-w-full rounded sm:w-28" />
              <Skeleton className="h-6 w-20 max-w-full rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudioSupportersPageSkeleton;
