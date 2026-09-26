"use client";

import { api } from "@convex/_generated/api";
import { IconStar } from "@tabler/icons-react";
import { usePaginatedQuery, useQuery } from "convex/react";
import React from "react";
import { FOUNDING_SUPPORTER_LIMIT } from "shared";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";
import StudioSupportersPageSkeleton from "./StudioSupportersPageSkeleton";

function formatSince(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const StudioSupportersPage: React.FC = () => {
  const summary = useQuery(api.artists.supporterSummary, {});
  const list = usePaginatedQuery(
    api.artists.listSupporters,
    {},
    { initialNumItems: 30 }
  );

  if (summary === undefined || list.status === "LoadingFirstPage") {
    return <StudioSupportersPageSkeleton />;
  }

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
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
            <p className="font-display text-lg text-text">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-surface px-5 py-3 text-right">
            <p className="text-xs text-text/40">Founding members</p>
            <p className="font-display text-lg text-primary">
              {summary.foundingCount}
            </p>
          </div>
        </div>
      </div>

      {list.results.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-12 text-center">
          <Text className="text-sm text-text/50">
            No one is routing to you yet. When a supporter picks you, they show
            up here.
          </Text>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
          <div>
            <div className="grid grid-cols-[minmax(0,1fr)_5.75rem_5.5rem] items-center gap-2 border-b border-white/5 px-4 py-3 text-xs uppercase tracking-wider text-text/40 sm:grid-cols-[minmax(0,1fr)_13.75rem_10rem] sm:gap-4 sm:px-6">
              <span>Name</span>
              <span className="sm:hidden">Since</span>
              <span className="hidden sm:inline">Routing since</span>
              <span>Founding</span>
            </div>
            <ul className="divide-y divide-white/5">
              {list.results.map((row) => (
                <li
                  key={row.profileId}
                  className="grid grid-cols-[minmax(0,1fr)_5.75rem_5.5rem] items-center gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_13.75rem_10rem] sm:gap-4 sm:px-6"
                >
                  <p className="truncate text-sm font-semibold text-text">
                    {row.displayName}
                  </p>
                  <p className="text-sm text-text/60">
                    {formatSince(row.startedAt)}
                  </p>
                  <div>
                    {row.founding ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        <IconStar size={10} />
                        Founding
                      </span>
                    ) : (
                      <span className="text-sm text-text/35">—</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {list.status === "CanLoadMore" ? (
              <div className="border-t border-white/5 px-5 py-4">
                <button
                  type="button"
                  className="text-sm font-semibold text-primary"
                  onClick={() => list.loadMore(30)}
                >
                  Load more
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioSupportersPage;
