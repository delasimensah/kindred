"use client";

import { Button, TextInput } from "@mantine/core";
import { IconCircleCheck, IconSearch } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

export interface AdminArtistRow {
  artistId: string;
  name: string;
  handle: string;
  verified: boolean;
  supporterCount: number;
  createdAt: number;
  avatarUrl: string | null;
}

type ArtistFilter = "all" | "verified" | "unverified";

interface AdminArtistsPageProps {
  artists: AdminArtistRow[];
  busyId: string | null;
  onSetVerified: (artistId: string, verified: boolean) => void;
}

function joinedLabel(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

const AdminArtistsPage: React.FC<AdminArtistsPageProps> = ({
  artists,
  busyId,
  onSetVerified,
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ArtistFilter>("all");
  const needle = search.trim().toLowerCase();
  const visible = useMemo(() => {
    return artists.filter((artist) => {
      if (filter === "verified" && !artist.verified) {
        return false;
      }
      if (filter === "unverified" && artist.verified) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return `${artist.name} ${artist.handle}`.toLowerCase().includes(needle);
    });
  }, [artists, filter, needle]);

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            Artists
          </Heading>
          <Text className="mt-1.5 text-sm text-text/50">
            Manage verification status for artists on Kindred.
          </Text>
        </div>
        <TextInput
          aria-label="Search artists"
          placeholder="Search artists"
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

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          label="All artists"
          selected={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterChip
          label="Verified"
          selected={filter === "verified"}
          onClick={() => setFilter("verified")}
        />
        <FilterChip
          label="Unverified"
          selected={filter === "unverified"}
          onClick={() => setFilter("unverified")}
        />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-12 text-center">
          <Text className="text-sm text-text/50">No artists match.</Text>
        </div>
      ) : (
        <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
          {visible.map((artist) => (
            <li
              key={artist.artistId}
              className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                {artist.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={artist.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {artist.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-text">
                    {artist.name}
                    {artist.verified ? (
                      <IconCircleCheck
                        size={14}
                        className="shrink-0 text-primary"
                        aria-label="Verified"
                      />
                    ) : null}
                  </p>
                  <p className="text-xs text-text/40">
                    @{artist.handle} · Joined {joinedLabel(artist.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="text-sm text-text/70">
                  {artist.supporterCount.toLocaleString()} supporters
                </p>
                <Button
                  disabled={busyId !== null}
                  loading={busyId === artist.artistId}
                  onClick={() =>
                    onSetVerified(artist.artistId, !artist.verified)
                  }
                  className={
                    artist.verified
                      ? "h-auto rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-text/70 hover:bg-white/5"
                      : "h-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95"
                  }
                >
                  {artist.verified ? "Unverify" : "Verify"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary"
          : "rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-text/60 hover:bg-white/5"
      }
    >
      {label}
    </button>
  );
}

export default AdminArtistsPage;
