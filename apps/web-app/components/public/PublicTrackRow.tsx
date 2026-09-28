"use client";

import { IconLock, IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { formatVoiceDuration } from "@/utils";

import type { PublicTrackItem } from "./publicCatalog";

interface PublicTrackRowProps {
  track: PublicTrackItem;
  position: number;
  active: boolean;
  playing: boolean;
  onPlay: (trackId: string) => void;
}

const PublicTrackRow: React.FC<PublicTrackRowProps> = ({
  track,
  position,
  active,
  playing,
  onPlay,
}) => {
  const href = `/track/${track.trackId}`;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 ${
        track.locked || active ? "bg-primary/5" : ""
      }`}
    >
      {track.locked ? (
        <span className="flex h-5 w-5 items-center justify-center text-primary/70">
          <IconLock size={12} aria-hidden />
        </span>
      ) : (
        <button
          type="button"
          aria-label={
            active && playing ? `Pause ${track.title}` : `Play ${track.title}`
          }
          onClick={() => onPlay(track.trackId)}
          className="flex h-5 w-5 items-center justify-center text-primary"
        >
          {active && playing ? (
            <IconPlayerPause size={12} />
          ) : active ? (
            <IconPlayerPlay size={12} />
          ) : (
            <span className="text-sm text-text/35">{position}</span>
          )}
        </button>
      )}
      <Artwork url={track.artworkUrl} dimmed={track.locked} />
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className={`block truncate text-sm font-medium ${
            track.locked
              ? "text-text/70"
              : active
                ? "text-primary"
                : "text-text"
          }`}
        >
          {track.title}
        </Link>
        <p className="truncate text-xs text-text/45">
          {track.artistName}
          {track.locked ? " · Exclusive" : ` · ${track.kindLabel}`}
        </p>
      </div>
      {track.locked ? (
        <Link
          href="/get-the-app"
          aria-label={`Get the app to hear ${track.title}`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95 sm:px-4"
        >
          Get the app
        </Link>
      ) : (
        <span className="w-10 shrink-0 text-right text-xs text-text/40">
          {formatVoiceDuration(track.durationMs)}
        </span>
      )}
    </div>
  );
};

export function Artwork({
  url,
  dimmed = false,
  className = "h-12 w-12 rounded-lg",
}: {
  url: string | null;
  dimmed?: boolean;
  className?: string;
}) {
  if (url === null) {
    return (
      <div
        className={`${className} shrink-0 bg-white/10 ${dimmed ? "opacity-60" : ""}`}
        aria-hidden
      />
    );
  }
  return (
    // Convex file URLs are not next/image hosts.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className={`${className} shrink-0 object-cover ${dimmed ? "opacity-60" : ""}`}
    />
  );
}

export default PublicTrackRow;
