"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button, Textarea } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";

import { showErrorNotification, showSuccessNotification } from "@/utils";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";
import StudioThankYousPageSkeleton from "./StudioThankYousPageSkeleton";

function formatSince(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const StudioThankYousPage: React.FC = () => {
  const candidates = useQuery(api.thankYous.rankCandidates, {});
  const send = useMutation(api.thankYous.send);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  if (candidates === undefined) {
    return <StudioThankYousPageSkeleton />;
  }

  const visible = candidates.filter((row) => !sentIds.has(row.profileId));

  const onSend = async (profileId: Id<"profiles">, fallback: string) => {
    const body = (overrides[profileId] ?? fallback).trim();
    if (body.length === 0) {
      showErrorNotification("Write a short thank-you before sending.");
      return;
    }
    setSendingId(profileId);
    try {
      await send({ profileId, body });
      setSentIds((prev) => new Set(prev).add(profileId));
      showSuccessNotification("Thank-you sent.");
    } catch (error) {
      showErrorNotification(
        error instanceof Error ? error.message : "Could not send thank-you."
      );
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-9">
        <Text className="mb-2 text-xs text-text/40">
          Thank-yous / Fans to thank
        </Text>
        <Heading
          variant="page"
          className="mb-0 font-display text-[32px] font-medium leading-tight text-text sm:text-[44px]"
        >
          {visible.length} fans to thank
        </Heading>
        <Text className="mt-2 max-w-xl text-sm text-text/50">
          Founding supporters first, then who has routed to you the longest.
          After you send, they leave this list and the next person moves up.
          Edit the one-liner, then send.
        </Text>
      </div>

      {visible.length === 0 ? (
        <div className="max-w-[860px] rounded-2xl border border-white/5 bg-surface px-6 py-12 text-center">
          <Text className="text-sm text-text/50">
            No fans left to thank right now. New routers appear here when they
            pick you.
          </Text>
        </div>
      ) : (
        <ul className="max-w-[860px] space-y-3">
          {visible.map((row, index) => (
            <li
              key={row.profileId}
              className={
                index === 0
                  ? "flex flex-col gap-4 rounded-2xl border border-primary/30 bg-surface p-5 sm:flex-row sm:items-start"
                  : "flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface p-5 sm:flex-row sm:items-start"
              }
            >
              <span
                className={
                  index === 0
                    ? "w-8 shrink-0 pt-1 font-display text-2xl text-primary"
                    : "w-8 shrink-0 pt-1 font-display text-2xl text-text/40"
                }
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text">
                    {row.displayName}
                  </p>
                  <span className="text-xs text-text/40">
                    · since {formatSince(row.startedAt)}
                  </span>
                  {row.founding ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      <IconStar size={9} />
                      Founding
                    </span>
                  ) : null}
                </div>
                <Textarea
                  rows={2}
                  value={overrides[row.profileId] ?? row.draft}
                  onChange={(event) =>
                    setOverrides((prev) => ({
                      ...prev,
                      [row.profileId]: event.currentTarget.value,
                    }))
                  }
                  classNames={{
                    input:
                      "rounded-xl border-white/10 bg-page text-sm text-text",
                  }}
                />
              </div>
              <Button
                onClick={() => void onSend(row.profileId, row.draft)}
                loading={sendingId === row.profileId}
                className="mt-1 w-full shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-textOnPrimary hover:brightness-95 sm:w-auto"
              >
                Send thank-you
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudioThankYousPage;
