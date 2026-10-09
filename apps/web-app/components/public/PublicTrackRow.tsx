"use client";

import { IconLock, IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { formatVoiceDuration } from "@/utils";

import GetTheAppButton from "./GetTheAppButton";
import PlayingBars from "./PlayingBars";
import type { PublicTrackItem } from "./publicCatalog";

interface PublicTrackRowProps {
  track: PublicTrackItem;
  position: number;
  active: boolean;
  playing: boolean;
  onPlay: (trackId: string) => void;
  /** Artist list names the release. Mix names the artist. More-from names the release only. */
  detail?: "catalog" | "mix" | "more";
}

function detailLine(
  track: PublicTrackItem,
  detail: "catalog" | "mix" | "more"
) {
  if (detail === "more") {
    return track.locked ? "Exclusive" : track.kindLabel;
  }
  if (detail === "mix") {
    return track.locked ? `${track.artistName} · Exclusive` : track.artistName;
  }
  return track.locked
    ? `${track.artistName} · ${track.kindLabel} · Exclusive`
    : `${track.artistName} · ${track.kindLabel}`;
}

const PublicTrackRow: React.FC<PublicTrackRowProps> = ({
  track,
  position,
  active,
  playing,
  onPlay,
  detail = "catalog",
}) => {
  const href = `/track/${track.trackId}`;
  const showPause = active && playing;
  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03] sm:gap-4 sm:px-6 sm:py-4 ${
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
            showPause ? `Pause ${track.title}` : `Play ${track.title}`
          }
          onClick={() => onPlay(track.trackId)}
          className="flex h-5 w-5 items-center justify-center"
        >
          <span
            className={
              showPause ? "hidden" : "text-sm text-text/35 group-hover:hidden"
            }
          >
            {position}
          </span>
          {showPause ? (
            <>
              <PlayingBars className="group-hover:hidden" />
              <IconPlayerPause
                size={12}
                className="hidden text-primary group-hover:block"
              />
            </>
          ) : (
            <IconPlayerPlay
              size={12}
              className="hidden text-primary group-hover:block"
            />
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
          {detailLine(track, detail)}
        </p>
      </div>
      {track.locked ? (
        <GetTheAppButton
          label={`Get the app to hear ${track.title}`}
          iconSize={12}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95 sm:gap-2 sm:px-4"
        />
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
