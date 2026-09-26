"use client";

import { api } from "@convex/_generated/api";
import { IconHeart, IconInfoCircle, IconReceipt } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import React from "react";
import { formatUsdFromCents } from "shared";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";
import StudioEarningsPageSkeleton from "./StudioEarningsPageSkeleton";

function periodLabel(period: string): string {
  const [year, month] = period.split("-");
  if (year === undefined || month === undefined) {
    return period;
  }
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function shortMonth(period: string): string {
  const [year, month] = period.split("-");
  if (year === undefined || month === undefined) {
    return period;
  }
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return date.toLocaleDateString(undefined, {
    month: "short",
    timeZone: "UTC",
  });
}

const StudioEarningsPage: React.FC = () => {
  const data = useQuery(api.earnings.listForArtist, {});

  if (data === undefined) {
    return <StudioEarningsPageSkeleton />;
  }

  const { current, prior, months } = data;
  const delta =
    prior.amountCents === 0
      ? null
      : ((current.amountCents - prior.amountCents) / prior.amountCents) * 100;
  const chartMonths = [...months].reverse().slice(-6);
  const maxAmount = Math.max(1, ...chartMonths.map((row) => row.amountCents));

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-8">
        <Heading
          variant="page"
          className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
        >
          Earnings
        </Heading>
        <Text className="mt-1.5 text-sm text-text/50">
          Your share of supporter plans routed to you this month.
        </Text>
      </div>

      <div className="mb-6 rounded-2xl border border-white/5 bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-text/45">
              This month · {shortMonth(current.period)}
            </p>
            <p className="font-display text-[40px] leading-none text-text sm:text-[56px]">
              {formatUsdFromCents(current.amountCents)}
            </p>
            <p className="mt-3 text-sm text-text/45">
              Your share of supporter subscriptions routed to you
            </p>
          </div>
          {delta !== null ? (
            <div className="text-right">
              <p className="mb-1 text-xs text-text/40">
                vs. {shortMonth(prior.period)}
              </p>
              <p
                className={
                  delta >= 0
                    ? "text-sm font-semibold text-emerald-400"
                    : "text-sm font-semibold text-red-400"
                }
              >
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(1)}%
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mb-6 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-text/45">
              From supporters
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <IconHeart size={14} className="text-primary" />
            </div>
          </div>
          <p className="font-display text-[28px] leading-none text-text">
            {formatUsdFromCents(current.amountCents)}
          </p>
          <p className="mt-3 text-xs text-text/40">
            Your share of the artist pool from {current.supporterCount}{" "}
            supporter
            {current.supporterCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-text/45">
              Store fees (30%)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              <IconReceipt size={14} className="text-text/60" />
            </div>
          </div>
          <p className="font-display text-[28px] leading-none text-text/70">
            {formatUsdFromCents(current.storeFeeCents)}
          </p>
          <p className="mt-3 text-xs text-text/40">
            Deducted from subscription revenue before the artist pool splits
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6 sm:p-7">
        <div className="mb-5 flex items-center gap-2">
          <IconInfoCircle size={16} className="text-primary" />
          <h2 className="text-base font-semibold text-text">
            How it&apos;s calculated
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <span className="font-display text-sm text-primary">70%</span>
            </div>
            <p className="text-sm leading-relaxed text-text/60">
              Of every supporter&apos;s monthly plan goes into the artist pool
              after store fees.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <span className="text-sm text-text/60">=</span>
            </div>
            <p className="text-sm leading-relaxed text-text/60">
              The pool splits equally across every artist that supporter has
              routed to.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <span className="text-sm text-text/60">you</span>
            </div>
            <p className="text-sm leading-relaxed text-text/60">
              You get your equal share for every plan where you&apos;re one of
              the routed artists.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text">Monthly totals</h2>
          <span className="text-xs text-text/35">
            Your earnings from routed supporters
          </span>
        </div>
        {chartMonths.length === 0 ? (
          <Text className="py-10 text-center text-sm text-text/50">
            No earnings months yet.
          </Text>
        ) : (
          <div className="flex h-48 items-end gap-3 sm:h-64 sm:gap-4">
            {chartMonths.map((row) => (
              <div
                key={row.period}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  className="w-full max-w-[48px] rounded-t-md bg-primary/80"
                  style={{
                    height: `${Math.max(4, (row.amountCents / maxAmount) * 100)}%`,
                  }}
                  title={formatUsdFromCents(row.amountCents)}
                />
                <span className="text-[11px] text-text/45">
                  {shortMonth(row.period)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-center gap-2 border-b border-white/5 px-4 py-3 text-xs uppercase tracking-wider text-text/40 sm:grid-cols-[1fr_1fr_1fr] sm:px-6">
          <span>Month</span>
          <span className="sm:hidden">Fans</span>
          <span className="hidden sm:inline">Supporters routed</span>
          <span>Earnings</span>
        </div>
        {months.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Text className="text-sm text-text/50">No months to show yet.</Text>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {months.map((row) => (
              <li
                key={row.period}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] items-center gap-2 px-4 py-4 sm:grid-cols-[1fr_1fr_1fr] sm:px-6"
              >
                <span className="text-sm font-medium text-text">
                  <span className="sm:hidden">{shortMonth(row.period)}</span>
                  <span className="hidden sm:inline">
                    {periodLabel(row.period)}
                  </span>
                </span>
                <span className="text-sm text-text/60">
                  {row.supporterCount}
                </span>
                <span className="text-sm font-semibold text-primary">
                  {formatUsdFromCents(row.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudioEarningsPage;
