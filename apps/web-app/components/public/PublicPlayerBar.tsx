"use client";

import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { formatVoiceDuration } from "@/utils";

import { Artwork } from "./PublicTrackRow";

interface PublicPlayerBarProps {
  title: string;
  artistName: string;
  artworkUrl: string | null;
  positionMs: number;
  durationMs: number;
  playing: boolean;
  canNext: boolean;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (positionMs: number) => void;
}

const PublicPlayerBar: React.FC<PublicPlayerBarProps> = ({
  title,
  artistName,
  artworkUrl,
  positionMs,
  durationMs,
  playing,
  canNext,
  onToggle,
  onPrevious,
  onNext,
  onSeek,
}) => {
  const position = Math.min(Math.max(positionMs, 0), durationMs || 0);
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-surface px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:h-14 md:flex-row md:items-center md:gap-5">
        <div className="flex min-w-0 items-center gap-3 md:w-64 md:shrink-0">
          <Artwork url={artworkUrl} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">{title}</p>
            <p className="truncate text-xs text-text/45">{artistName}</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="Previous track"
              onClick={onPrevious}
              className="text-text/60 hover:text-text"
            >
              <IconPlayerSkipBack size={18} />
            </button>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={onToggle}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-textOnPrimary hover:brightness-95"
            >
              {playing ? (
                <IconPlayerPause size={14} />
              ) : (
                <IconPlayerPlay size={14} className="ml-0.5" />
              )}
            </button>
            <button
              type="button"
              aria-label="Next track"
              onClick={onNext}
              disabled={!canNext}
              className="text-text/60 hover:text-text disabled:opacity-30"
            >
              <IconPlayerSkipForward size={18} />
            </button>
          </div>
          <div className="flex w-full max-w-xl items-center gap-3">
            <span className="w-9 text-right text-[11px] text-text/40">
              {formatVoiceDuration(position)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(durationMs, 0)}
              value={position}
              aria-label="Seek"
              onChange={(event) => onSeek(Number(event.target.value))}
              className="h-1 min-w-0 flex-1 accent-primary"
            />
            <span className="w-9 text-[11px] text-text/40">
              {formatVoiceDuration(durationMs)}
            </span>
          </div>
        </div>
        <div className="hidden justify-end md:flex md:w-64 md:shrink-0">
          <Link
            href="/get-the-app"
            className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-textOnPrimary hover:brightness-95"
          >
            Get the app
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicPlayerBar;
