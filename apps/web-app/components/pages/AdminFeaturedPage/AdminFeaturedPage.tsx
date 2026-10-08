"use client";

import { Button } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import React, { useState } from "react";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

export const FEATURED_SLOT_CAP = 6;

export interface FeaturedSlotRow {
  artistId: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
  live: boolean;
}

export interface FeaturedArtistOption {
  artistId: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
}

interface AdminFeaturedPageProps {
  slots: FeaturedSlotRow[];
  artists: FeaturedArtistOption[];
  dirty: boolean;
  saving: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (artistId: string) => void;
  onAdd: (artistId: string) => void;
  onSave: () => void;
}

const AdminFeaturedPage: React.FC<AdminFeaturedPageProps> = ({
  slots,
  artists,
  dirty,
  saving,
  onMove,
  onRemove,
  onAdd,
  onSave,
}) => {
  const [adding, setAdding] = useState(false);
  const taken = new Set(slots.map((slot) => slot.artistId));
  const available = artists.filter((artist) => !taken.has(artist.artistId));
  const full = slots.length >= FEATURED_SLOT_CAP;
  const emptyCount = FEATURED_SLOT_CAP - slots.length;

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            Featured discovery slots
          </Heading>
          <Text className="mt-1.5 max-w-xl text-sm text-text/50">
            Choose the artists fans see first on Discover. Move them to set the
            order, then save.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={full}
            onClick={() => setAdding((open) => !open)}
            leftSection={<IconPlus size={14} />}
            className="h-auto rounded-xl border border-white/10 bg-transparent px-5 py-3 text-sm font-semibold text-text hover:bg-white/5"
          >
            Add
          </Button>
          <Button
            disabled={!dirty || saving}
            loading={saving}
            onClick={onSave}
            className="h-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95"
          >
            Save
          </Button>
        </div>
      </div>

      {adding && !full ? (
        <div className="mb-6 max-w-3xl rounded-2xl border border-white/5 bg-surface p-4">
          <Text className="mb-3 text-xs text-text/45">Add an artist</Text>
          {available.length === 0 ? (
            <Text className="text-sm text-text/50">
              Every visible artist is already in a slot.
            </Text>
          ) : (
            <ul className="flex flex-col gap-2">
              {available.map((artist) => (
                <li key={artist.artistId}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(artist.artistId);
                      setAdding(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/5"
                  >
                    <ArtistMark
                      name={artist.name}
                      avatarUrl={artist.avatarUrl}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text">
                        {artist.name}
                      </span>
                      <span className="block truncate text-xs text-text/45">
                        @{artist.handle}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className="max-w-3xl overflow-hidden rounded-2xl border border-white/5 bg-surface">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6">
          <p className="text-xs text-text/45">Slot order</p>
          <p className="text-xs text-text/35">
            {slots.length} of {FEATURED_SLOT_CAP} slots filled
          </p>
        </div>
        <ul className="divide-y divide-white/5">
          {slots.map((slot, index) => (
            <li
              key={slot.artistId}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <ArtistMark name={slot.name} avatarUrl={slot.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">
                    {slot.name}
                  </p>
                  <p className="truncate text-xs text-text/45">{slot.bio}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <span
                  className={
                    slot.live
                      ? "rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                      : "rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-text/50"
                  }
                >
                  {slot.live ? "Live" : "Hidden"}
                </span>
                <Button
                  aria-label={`Move ${slot.name} earlier`}
                  disabled={index === 0}
                  onClick={() => onMove(index, -1)}
                  className="h-8 w-8 rounded-lg border border-white/10 bg-transparent p-0 text-text/60 hover:bg-white/5"
                >
                  <IconArrowUp size={14} />
                </Button>
                <Button
                  aria-label={`Move ${slot.name} later`}
                  disabled={index === slots.length - 1}
                  onClick={() => onMove(index, 1)}
                  className="h-8 w-8 rounded-lg border border-white/10 bg-transparent p-0 text-text/60 hover:bg-white/5"
                >
                  <IconArrowDown size={14} />
                </Button>
                <Button
                  aria-label={`Remove ${slot.name}`}
                  onClick={() => onRemove(slot.artistId)}
                  className="h-8 w-8 rounded-lg bg-transparent p-0 text-text/50 hover:bg-white/5 hover:text-red-400"
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </li>
          ))}
          {Array.from({ length: emptyCount }, (_, offset) => (
            <li
              key={`empty-${slots.length + offset}`}
              className="mx-3 my-3 flex items-center gap-4 rounded-xl border-2 border-dashed border-white/10 px-4 py-4 text-text/35 sm:px-6"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-text/40">
                {slots.length + offset + 1}
              </span>
              <p className="text-sm">Empty slot</p>
              <button
                type="button"
                disabled={full}
                onClick={() => setAdding(true)}
                className="ml-auto text-xs font-semibold text-primary hover:underline"
              >
                Add artist
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function ArtistMark({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default AdminFeaturedPage;
