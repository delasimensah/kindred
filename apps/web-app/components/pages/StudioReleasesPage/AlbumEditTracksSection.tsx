"use client";

import type { Id } from "@convex/_generated/dataModel";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import React, { useRef } from "react";

import Text from "../../ui/Text/Text";
import { studioFieldClassNames } from "../studioFieldStyles";

export type AlbumEditTrackRow = {
  trackId: Id<"tracks">;
  title: string;
  position: number;
  durationMs: number;
};

interface AlbumEditTracksSectionProps {
  type: "ep" | "album";
  tracks: AlbumEditTrackRow[];
  onChangeTitle: (trackId: Id<"tracks">, title: string) => void;
  onMove: (trackId: Id<"tracks">, direction: -1 | 1) => void;
  onRemove: (trackId: Id<"tracks">) => void;
  onAdd: (payload: { title: string; file: File }) => Promise<void>;
  isAdding: boolean;
  busyTrackId: Id<"tracks"> | null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const AlbumEditTracksSection: React.FC<AlbumEditTracksSectionProps> = ({
  type,
  tracks,
  onChangeTitle,
  onMove,
  onRemove,
  onAdd,
  isAdding,
  busyTrackId,
}) => {
  const atEpCap = type === "ep" && tracks.length >= 6;
  const atMin =
    (type === "ep" && tracks.length <= 2) ||
    (type === "album" && tracks.length <= 7);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Text className="text-sm font-medium text-text">Tracks</Text>
          <Text className="mt-0.5 text-xs text-text/45">
            {type === "ep"
              ? "EP · 2 to 6 tracks. Reorder, rename, add, or remove."
              : "Album · at least 7 tracks. Reorder, rename, add, or remove."}
          </Text>
        </div>
        <Button
          type="button"
          variant="subtle"
          size="compact-sm"
          leftSection={<IconPlus size={14} />}
          disabled={atEpCap || isAdding}
          loading={isAdding}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 self-start text-primary"
        >
          Add track
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) {
            void onAdd({
              title: file.name.replace(/\.[^.]+$/, ""),
              file,
            });
          }
          event.currentTarget.value = "";
        }}
      />
      <div className="space-y-3">
        {tracks.map((track, index) => {
          const busy = busyTrackId === track.trackId;
          return (
            <div
              key={track.trackId}
              className="min-w-0 rounded-xl border border-white/10 bg-page p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="min-w-0 text-xs font-semibold text-text/45">
                  Track {index + 1}
                  <span className="ml-2 font-normal normal-case tracking-normal text-text/35">
                    {formatDuration(track.durationMs)}
                  </span>
                </p>
                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Move track ${index + 1} up`}
                    disabled={index === 0 || busy}
                    onClick={() => onMove(track.trackId, -1)}
                  >
                    <IconArrowUp size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    aria-label={`Move track ${index + 1} down`}
                    disabled={index === tracks.length - 1 || busy}
                    onClick={() => onMove(track.trackId, 1)}
                  >
                    <IconArrowDown size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label={`Remove track ${index + 1}`}
                    disabled={atMin || busy}
                    onClick={() => onRemove(track.trackId)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </div>
              </div>
              <TextInput
                label="Title"
                value={track.title}
                onChange={(event) =>
                  onChangeTitle(track.trackId, event.currentTarget.value)
                }
                classNames={studioFieldClassNames}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlbumEditTracksSection;
