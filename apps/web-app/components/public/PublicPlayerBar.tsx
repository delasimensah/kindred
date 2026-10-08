"use client";

import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
} from "@tabler/icons-react";
import React from "react";

import { formatVoiceDuration } from "@/utils";

import GetTheAppButton from "./GetTheAppButton";
import { Artwork } from "./PublicTrackRow";

interface PublicPlayerBarProps {
  title: string;
  artistName: string;
  artworkUrl: string | null;
  positionMs: number;
  durationMs: number;
  playing: boolean;
  canNext: boolean;
  showGetTheApp?: boolean;
  className?: string;
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
  showGetTheApp = true,
  className = "inset-x-0",
  onToggle,
  onPrevious,
  onNext,
  onSeek,
}) => {
  const position = Math.min(Math.max(positionMs, 0), durationMs || 0);
  const played = durationMs > 0 ? `${(position / durationMs) * 100}%` : "0%";
  return (
    <div
      className={`fixed bottom-0 z-50 border-t border-white/10 bg-surface pb-[env(safe-area-inset-bottom)] md:h-20 md:pb-0 ${className}`}
    >
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 px-3 py-2 md:grid-cols-[minmax(0,1fr)_minmax(17rem,1.5fr)_minmax(0,1fr)] md:content-center md:gap-x-5 md:gap-y-1.5 md:px-6 md:py-0">
        <div className="col-start-1 row-start-2 flex min-w-0 items-center gap-2.5 md:row-span-2 md:row-start-1 md:gap-3">
          <Artwork
            url={artworkUrl}
            className="h-10 w-10 rounded-md md:h-12 md:w-12 md:rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">{title}</p>
            <p className="truncate text-xs text-text/45">{artistName}</p>
          </div>
        </div>

        <div className="col-start-2 row-start-2 flex items-center justify-center gap-1 md:col-start-2 md:row-start-1 md:gap-6">
          <button
            type="button"
            aria-label="Previous track"
            onClick={onPrevious}
            className="flex h-9 w-9 items-center justify-center text-text/60 hover:text-text"
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
            className="flex h-9 w-9 items-center justify-center text-text/60 hover:text-text disabled:opacity-30"
          >
            <IconPlayerSkipForward size={18} />
          </button>
        </div>

        <div className="col-span-2 row-start-1 flex items-center gap-3 py-1 md:col-span-1 md:col-start-2 md:row-start-2 md:py-0">
          <span className="hidden w-9 text-right text-[11px] text-text/40 md:inline">
            {formatVoiceDuration(position)}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(durationMs, 0)}
            value={position}
            aria-label="Seek"
            onChange={(event) => onSeek(Number(event.target.value))}
            style={{
              background: `linear-gradient(to right, #FFD369 ${played}, rgba(255,255,255,0.22) ${played})`,
            }}
            className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#FFD369] [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFD369]"
          />
          <span className="hidden w-9 text-[11px] text-text/40 md:inline">
            {formatVoiceDuration(durationMs)}
          </span>
        </div>

        {showGetTheApp ? (
          <div className="hidden justify-end md:col-start-3 md:row-span-2 md:row-start-1 md:flex">
            <GetTheAppButton
              iconSize={14}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-textOnPrimary hover:brightness-95"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PublicPlayerBar;
