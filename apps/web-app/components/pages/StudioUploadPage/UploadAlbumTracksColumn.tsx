"use client";

import { ActionIcon, Button, TextInput } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import React from "react";

import { studioFieldClassNames } from "../studioFieldStyles";

export type AlbumTrackDraft = {
  key: string;
  title: string;
  audioName: string | null;
  audioFileId: string | null;
  peaks: number[] | null;
  durationMs: number | null;
  peaksProgress: number | null;
  audioError: string | null;
};

interface UploadAlbumTracksColumnProps {
  tracks: AlbumTrackDraft[];
  onChangeTitle: (key: string, title: string) => void;
  onPickAudio: (key: string, file: File) => void;
  onMove: (key: string, direction: -1 | 1) => void;
  onRemove: (key: string) => void;
  onAdd: () => void;
}

const UploadAlbumTracksColumn: React.FC<UploadAlbumTracksColumnProps> = ({
  tracks,
  onChangeTitle,
  onPickAudio,
  onMove,
  onRemove,
  onAdd,
}) => {
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-text">Tracks</p>
        <Button
          type="button"
          variant="subtle"
          size="compact-sm"
          leftSection={<IconPlus size={14} />}
          onClick={onAdd}
          className="shrink-0 self-start text-primary"
        >
          Add track
        </Button>
      </div>
      {tracks.map((track, index) => (
        <div
          key={track.key}
          className="min-w-0 rounded-xl border border-white/10 bg-page p-3 sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="min-w-0 text-xs font-semibold uppercase tracking-wide text-text/45">
              Track {index + 1}
            </p>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <ActionIcon
                variant="subtle"
                aria-label={`Move track ${index + 1} up`}
                disabled={index === 0}
                onClick={() => onMove(track.key, -1)}
              >
                <IconArrowUp size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                aria-label={`Move track ${index + 1} down`}
                disabled={index === tracks.length - 1}
                onClick={() => onMove(track.key, 1)}
              >
                <IconArrowDown size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                aria-label={`Remove track ${index + 1}`}
                disabled={tracks.length <= 2}
                onClick={() => onRemove(track.key)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </div>
          </div>
          <TextInput
            label="Title"
            value={track.title}
            onChange={(event) =>
              onChangeTitle(track.key, event.currentTarget.value)
            }
            classNames={studioFieldClassNames}
            className="mb-3"
          />
          <label className="block min-w-0">
            <span className="mb-1.5 block text-sm font-medium text-text">
              Audio
            </span>
            <input
              type="file"
              accept="audio/*"
              className="block w-full max-w-full text-sm text-text/70 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-textOnPrimary"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) {
                  onPickAudio(track.key, file);
                }
                event.currentTarget.value = "";
              }}
            />
          </label>
          {track.audioName ? (
            <p className="mt-2 break-all text-xs text-text/55">
              {track.audioName}
              {track.peaksProgress !== null && track.peaksProgress < 100
                ? ` · peaks ${track.peaksProgress}%`
                : track.audioFileId
                  ? " · ready"
                  : ""}
            </p>
          ) : null}
          {track.audioError ? (
            <p className="mt-1 text-xs text-red-400">{track.audioError}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default UploadAlbumTracksColumn;
