"use client";

import { IconHeart, IconReceipt } from "@tabler/icons-react";
import React from "react";

import Heading from "../../ui/Heading/Heading";
import Skeleton from "../../ui/Skeleton/Skeleton";
import Text from "../../ui/Text/Text";
import EarningsExplainer from "./EarningsExplainer";

/** Labels and the explainer stay real. Only the amounts and bars load. */
const StudioEarningsPageSkeleton: React.FC = () => {
  return (
    <div
      className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10"
      aria-busy
      aria-label="Loading earnings"
    >
      <div className="mb-8">
        <Heading
          variant="page"
          className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
        >
          Earnings
        </Heading>
        <Text className="mt-1.5 text-sm text-text/50">
          Your share of supporter plans routed to you. Each month is added once
          it ends.
        </Text>
      </div>

      <div className="mb-6 rounded-2xl border border-white/5 bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-12 w-48 max-w-full rounded sm:h-14" />
            <Text className="text-sm text-text/45">
              Your share of supporter subscriptions routed to you
            </Text>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-3 w-20 rounded" />
            <Skeleton className="ml-auto h-4 w-14 rounded" />
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-text/50">From supporters</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <IconHeart size={14} className="text-primary" />
            </div>
          </div>
          <Skeleton className="mb-3 h-8 w-28 rounded" />
          <Skeleton className="h-3 w-48 max-w-full rounded" />
        </div>
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-text/50">Store fees (30%)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <IconReceipt size={14} className="text-text/60" />
            </div>
          </div>
          <Skeleton className="mb-3 h-8 w-28 rounded" />
          <p className="text-xs text-text/40">
            Deducted from subscription revenue before the artist pool splits
          </p>
        </div>
      </div>

      <EarningsExplainer />

      <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text">Monthly totals</h2>
          <span className="text-xs text-text/35">
            Your earnings from routed supporters
          </span>
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
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-center gap-2 border-b border-white/5 px-4 py-3 text-xs font-medium text-text/50 sm:grid-cols-[1fr_1fr_1fr] sm:px-6">
          <span>Month</span>
          <span className="sm:hidden">Fans</span>
          <span className="hidden sm:inline">Supporters routed</span>
          <span>Earnings</span>
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
