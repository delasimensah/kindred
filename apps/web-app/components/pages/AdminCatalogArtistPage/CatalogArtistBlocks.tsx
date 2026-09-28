"use client";

import { Button } from "@mantine/core";
import React from "react";

import CatalogTrackRow, {
  type CatalogTrackRowData,
} from "../AdminCatalogPage/CatalogTrackRow";
import type { CatalogReleaseRow } from "./AdminCatalogArtistPage";

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium text-text">{title}</h2>
        {hint !== undefined ? (
          <p className="mt-1 text-xs text-text/45">{hint}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ReleaseBlock({
  release,
  busyId,
  onSetReleaseHidden,
  onSetTrackHidden,
  onAskRemove,
}: {
  release: CatalogReleaseRow;
  busyId: string | null;
  onSetReleaseHidden: (releaseId: string, hidden: boolean) => void;
  onSetTrackHidden: (trackId: string, hidden: boolean) => void;
  onAskRemove: (track: CatalogTrackRowData) => void;
}) {
  const badge = release.type === "ep" ? "EP" : "Album";
  const kind = release.type === "ep" ? "EP" : "album";
  const trackCount =
    release.tracks.length === 1 ? "1 track" : `${release.tracks.length} tracks`;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
      <div className="flex flex-col gap-3 border-b border-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-text">{release.title}</p>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-text/70">
              {badge}
            </span>
          </div>
          <p className="mt-1 text-xs text-text/45">
            {trackCount} in this {kind}
            {release.hidden ? " · Hidden" : ""}
          </p>
        </div>
        <Button
          disabled={busyId !== null}
          loading={busyId === release.releaseId}
          onClick={() => onSetReleaseHidden(release.releaseId, !release.hidden)}
          className={
            release.hidden
              ? "h-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95"
              : "h-auto rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-text/70 hover:bg-white/5"
          }
        >
          {release.hidden ? `Unhide this ${kind}` : `Hide this ${kind}`}
        </Button>
      </div>
      <TrackBlock
        tracks={release.tracks}
        busyId={busyId}
        showArtist={false}
        onSetTrackHidden={onSetTrackHidden}
        onAskRemove={onAskRemove}
      />
    </div>
  );
}

export function TrackBlock({
  tracks,
  busyId,
  showArtist = true,
  onSetTrackHidden,
  onAskRemove,
}: {
  tracks: CatalogTrackRowData[];
  busyId: string | null;
  showArtist?: boolean;
  onSetTrackHidden: (trackId: string, hidden: boolean) => void;
  onAskRemove: (track: CatalogTrackRowData) => void;
}) {
  if (tracks.length === 0) {
    return null;
  }
  return (
    <ul className="divide-y divide-white/5">
      {tracks.map((track) => (
        <CatalogTrackRow
          key={track.trackId}
          track={track}
          busyId={busyId}
          showArtist={showArtist}
          onSetHidden={onSetTrackHidden}
          onRemove={() => onAskRemove(track)}
        />
      ))}
    </ul>
  );
}
