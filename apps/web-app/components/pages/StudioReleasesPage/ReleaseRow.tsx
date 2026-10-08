"use client";

import type { Id } from "@convex/_generated/dataModel";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import React from "react";

import Text from "../../ui/Text/Text";

export type ListRow = {
  key: string;
  kind: "single" | "release";
  trackId?: Id<"tracks">;
  releaseId?: Id<"releases">;
  title: string;
  typeLabel: string;
  state: "draft" | "scheduled" | "published";
  visibility: "public" | "supporters";
  hidden: boolean;
  artworkUrl: string | null;
  publishedAt: number | null;
  publishAt: number | null;
  sortAt: number;
  durationMs: number;
  trackCount?: number;
};

function formatWhen(ms: number | null): string {
  if (ms === null) {
    return "—";
  }
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function stateLabel(state: string, hidden: boolean): string {
  if (hidden) {
    return "Hidden";
  }
  if (state === "scheduled") {
    return "Scheduled";
  }
  if (state === "published") {
    return "Published";
  }
  return "Draft";
}

function stateDot(state: string, hidden: boolean): string {
  if (hidden || state === "draft") {
    return "bg-text/40";
  }
  if (state === "scheduled") {
    return "bg-primary";
  }
  return "bg-emerald-400";
}

interface ReleaseRowProps {
  release: ListRow;
  active: boolean;
  playing: boolean;
  onPlay: () => void;
  onEdit: () => void;
  actions: React.ReactNode;
}

const ReleaseRow: React.FC<ReleaseRowProps> = ({
  release,
  active,
  playing,
  onPlay,
  onEdit,
  actions,
}) => {
  const showPause = active && playing;
  const canPlay = release.kind === "single" || (release.trackCount ?? 0) > 0;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={onPlay}
          disabled={!canPlay}
          aria-label={`${showPause ? "Pause" : "Play"} ${release.title}`}
          className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-page disabled:cursor-not-allowed sm:h-14 sm:w-14"
        >
          {release.artworkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={release.artworkUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-text/35">
              Art
            </span>
          )}
          {canPlay ? (
            <span
              className={`absolute inset-0 flex items-center justify-center bg-black/45 text-white transition ${
                active
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
              }`}
            >
              {showPause ? (
                <IconPlayerPauseFilled size={18} />
              ) : (
                <IconPlayerPlayFilled size={18} />
              )}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${release.title}`}
          className="min-w-0 flex-1 rounded-xl text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Text
              className={`break-words text-sm font-medium sm:truncate ${active ? "text-primary" : "text-text"}`}
            >
              {release.title}
            </Text>
            <span className="rounded-full bg-page px-2 py-0.5 text-[11px] font-medium text-text/55">
              {release.typeLabel}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text/45">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${stateDot(release.state, release.hidden)}`}
              />
              {stateLabel(release.state, release.hidden)}
            </span>
            <span>
              {release.visibility === "supporters"
                ? "Supporters only"
                : "Public"}
            </span>
            <span>
              {release.state === "scheduled"
                ? formatWhen(release.publishAt)
                : formatWhen(release.publishedAt)}
            </span>
          </div>
        </button>
      </div>
      <div className="min-w-0 sm:shrink-0">{actions}</div>
    </div>
  );
};

export default ReleaseRow;
