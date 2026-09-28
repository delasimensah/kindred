"use client";

import { Button } from "@mantine/core";
import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";
import Text from "../../ui/Text/Text";
import type { CatalogArtistRow, CatalogBrowse } from "./AdminCatalogPage";
import CatalogTrackRow, { type CatalogTrackRowData } from "./CatalogTrackRow";

export function ResultsSkeleton() {
  return (
    <div
      className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface"
      aria-busy
      aria-label="Searching catalog"
    >
      {["one", "two", "three"].map((key) => (
        <div
          key={key}
          className="flex items-center justify-between px-4 py-4 sm:px-6"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SearchResults({
  artistMatches,
  tracks,
  busyId,
  onOpenArtist,
  onSetArtistHidden,
  onSetTrackHidden,
  onAskRemove,
  onBrowseChange,
}: {
  artistMatches: CatalogArtistRow[];
  tracks: CatalogTrackRowData[];
  busyId: string | null;
  onOpenArtist: (artistId: string) => void;
  onSetArtistHidden: (artistId: string, hidden: boolean) => void;
  onSetTrackHidden: (trackId: string, hidden: boolean) => void;
  onAskRemove: (track: CatalogTrackRowData) => void;
  onBrowseChange: (browse: CatalogBrowse) => void;
}) {
  if (artistMatches.length === 0 && tracks.length === 0) {
    return (
      <EmptyState message="No tracks match.">
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            className="text-sm font-semibold text-primary"
            onClick={() => onBrowseChange("hidden")}
          >
            Check Hidden
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-primary"
            onClick={() => onBrowseChange("scheduled")}
          >
            Check Scheduled
          </button>
        </div>
      </EmptyState>
    );
  }
  return (
    <div className="space-y-6">
      {artistMatches.length > 0 ? (
        <ArtistList
          artists={artistMatches}
          busyId={busyId}
          onOpenArtist={onOpenArtist}
          onSetArtistHidden={onSetArtistHidden}
        />
      ) : null}
      {tracks.length > 0 ? (
        <TrackList
          tracks={tracks}
          busyId={busyId}
          empty=""
          onSetTrackHidden={onSetTrackHidden}
          onAskRemove={onAskRemove}
        />
      ) : null}
    </div>
  );
}

export function ArtistList({
  artists,
  busyId,
  onOpenArtist,
  onSetArtistHidden,
}: {
  artists: CatalogArtistRow[];
  busyId: string | null;
  onOpenArtist: (artistId: string) => void;
  onSetArtistHidden: (artistId: string, hidden: boolean) => void;
}) {
  if (artists.length === 0) {
    return (
      <EmptyState message="No artists yet. Search if you already know the track title." />
    );
  }
  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
      {artists.map((artist) => (
        <li
          key={artist.artistId}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <button
            type="button"
            onClick={() => onOpenArtist(artist.artistId)}
            className="min-w-0 text-left"
          >
            <p className="truncate text-sm font-medium text-text">
              {artist.name}
            </p>
            <p className="truncate text-xs text-text/45">
              @{artist.handle}
              {artist.hidden ? " · Hidden" : ""}
            </p>
          </button>
          <Button
            disabled={busyId !== null}
            loading={busyId === artist.artistId}
            onClick={() => onSetArtistHidden(artist.artistId, !artist.hidden)}
            className={
              artist.hidden
                ? "h-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95"
                : "h-auto rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-text/70 hover:bg-white/5"
            }
          >
            {artist.hidden ? "Unhide" : "Hide"}
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function TrackList({
  tracks,
  busyId,
  empty,
  emptyAction,
  onEmptyAction,
  onSetTrackHidden,
  onAskRemove,
}: {
  tracks: CatalogTrackRowData[];
  busyId: string | null;
  empty: string;
  emptyAction?: string;
  onEmptyAction?: () => void;
  onSetTrackHidden: (trackId: string, hidden: boolean) => void;
  onAskRemove: (track: CatalogTrackRowData) => void;
}) {
  if (tracks.length === 0) {
    return (
      <EmptyState message={empty}>
        {emptyAction !== undefined && onEmptyAction !== undefined ? (
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-primary"
            onClick={onEmptyAction}
          >
            {emptyAction}
          </button>
        ) : null}
      </EmptyState>
    );
  }
  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-surface">
      {tracks.map((track) => (
        <CatalogTrackRow
          key={track.trackId}
          track={track}
          busyId={busyId}
          onSetHidden={onSetTrackHidden}
          onRemove={() => onAskRemove(track)}
        />
      ))}
    </ul>
  );
}

export function EmptyState({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface px-6 py-12 text-center">
      <Text className="text-sm text-text/50">{message}</Text>
      {children}
    </div>
  );
}

export function FilterChip({
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
