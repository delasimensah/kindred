"use client";

import { Button } from "@mantine/core";
import React from "react";

export interface CatalogTrackRowData {
  trackId: string;
  title: string;
  artistId: string;
  artistName: string;
  artworkUrl: string | null;
  visibility: "public" | "supporters";
  state: "scheduled" | "published";
  hidden: boolean;
}

export function trackVisibilityLabel(track: CatalogTrackRowData): string {
  if (track.hidden) {
    return "Hidden";
  }
  if (track.state === "scheduled") {
    return "Scheduled";
  }
  if (track.visibility === "supporters") {
    return "Supporters";
  }
  return "Public";
}

export function trackStatusLabel(track: CatalogTrackRowData): string {
  if (track.hidden) {
    return "Hidden";
  }
  if (track.state === "scheduled") {
    return "Pending release";
  }
  return "Live";
}

interface CatalogTrackRowProps {
  track: CatalogTrackRowData;
  busyId: string | null;
  showArtist?: boolean;
  onSetHidden: (trackId: string, hidden: boolean) => void;
  onRemove: (trackId: string) => void;
}

const CatalogTrackRow: React.FC<CatalogTrackRowProps> = ({
  track,
  busyId,
  showArtist = true,
  onSetHidden,
  onRemove,
}) => {
  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{track.title}</p>
        {showArtist ? (
          <p className="truncate text-xs text-text/45">{track.artistName}</p>
        ) : null}
        <p className="mt-1 text-xs text-text/60">
          {trackVisibilityLabel(track)} · {trackStatusLabel(track)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          disabled={busyId !== null}
          loading={busyId === track.trackId}
          onClick={() => onSetHidden(track.trackId, !track.hidden)}
          className={
            track.hidden
              ? "h-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95"
              : "h-auto rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-text/70 hover:bg-white/5"
          }
        >
          {track.hidden ? "Unhide" : "Hide"}
        </Button>
        <Button
          disabled={busyId !== null}
          onClick={() => onRemove(track.trackId)}
          className="h-auto rounded-lg border border-red-400/20 bg-transparent px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10"
        >
          Remove
        </Button>
      </div>
    </li>
  );
};

export default CatalogTrackRow;
