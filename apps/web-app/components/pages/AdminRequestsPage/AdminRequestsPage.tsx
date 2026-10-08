"use client";

import { Button, TextInput } from "@mantine/core";
import { IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import { getRelativeTime } from "shared";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

export interface AdminRequestRow {
  requestId: string;
  displayName: string;
  handle: string;
  bio: string;
  note: string;
  email: string;
  createdAt: number;
}

interface AdminRequestsPageProps {
  pending: AdminRequestRow[];
  pendingCount: number;
  approvedThisMonth: number;
  declinedThisMonth: number;
  busyId: string | null;
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

const AdminRequestsPage: React.FC<AdminRequestsPageProps> = ({
  pending,
  pendingCount,
  approvedThisMonth,
  declinedThisMonth,
  busyId,
  onApprove,
  onDecline,
}) => {
  const [search, setSearch] = useState("");
  const needle = search.trim().toLowerCase();
  const visible = useMemo(() => {
    if (needle.length === 0) {
      return pending;
    }
    return pending.filter((row) => {
      const haystack =
        `${row.displayName} ${row.handle} ${row.email} ${row.bio} ${row.note}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [needle, pending]);

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            Pending artist requests
          </Heading>
          <Text className="mt-1.5 text-sm text-text/50">
            Review and approve applications to become a Kindred artist.
          </Text>
        </div>
        <TextInput
          aria-label="Search requests"
          placeholder="Search requests"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          className="w-full lg:w-72"
          classNames={{
            input:
              "border-white/10 bg-surface text-text placeholder:text-text/35",
          }}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Pending" value={pendingCount} highlight />
        <Stat label="Approved this month" value={approvedThisMonth} />
        <Stat label="Declined this month" value={declinedThisMonth} />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-12 text-center">
          <Text className="text-sm text-text/50">
            {pending.length === 0
              ? "No requests are waiting."
              : "No requests match that search."}
          </Text>
        </div>
      ) : (
        <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
          {visible.map((row) => (
            <li
              key={row.requestId}
              className="flex flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">
                  {row.displayName}
                </p>
                <p className="text-xs text-text/40">@{row.handle}</p>
                <p className="mt-2 text-sm text-text/70">{row.email}</p>
                <p className="mt-2 text-sm leading-relaxed text-text/80">
                  {row.bio}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text/60">
                  {row.note}
                </p>
                <p className="mt-2 text-xs text-text/45">
                  Submitted {getRelativeTime(new Date(row.createdAt))}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                <Button
                  leftSection={<IconCheck size={12} />}
                  loading={busyId === row.requestId}
                  disabled={busyId !== null}
                  onClick={() => onApprove(row.requestId)}
                  className="h-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconX size={12} />}
                  disabled={busyId !== null}
                  onClick={() => onDecline(row.requestId)}
                  className="h-auto rounded-lg border-red-400/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10"
                >
                  Decline
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface px-6 py-5">
      <p className="mb-2 text-xs text-text/45">{label}</p>
      <p
        className={
          highlight
            ? "font-display text-3xl leading-none text-primary"
            : "font-display text-3xl leading-none text-text"
        }
      >
        {value}
      </p>
    </div>
  );
}

export default AdminRequestsPage;
