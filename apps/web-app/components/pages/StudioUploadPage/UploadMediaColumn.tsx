"use client";

import { IconCloudUpload, IconPhoto } from "@tabler/icons-react";
import React, { useRef } from "react";

import Text from "../../ui/Text/Text";

interface UploadMediaColumnProps {
  audioName: string | null;
  peaksProgress: number | null;
  artworkPreview: string | null;
  audioError: string | null;
  artworkError: string | null;
  onPickAudio: (file: File) => void;
  onPickArtwork: (file: File) => void;
}

const UploadMediaColumn: React.FC<UploadMediaColumnProps> = ({
  audioName,
  peaksProgress,
  artworkPreview,
  audioError,
  artworkError,
  onPickAudio,
  onPickArtwork,
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const audioBorder =
    audioError !== null
      ? "border-danger/60 hover:border-danger"
      : "border-white/15 hover:border-primary/50";
  const artworkBorder =
    artworkError !== null
      ? "border-danger/60 hover:border-danger"
      : "border-white/15 hover:border-primary/50";

  return (
    <div className="space-y-6 lg:col-span-2">
      <div>
        <button
          type="button"
          onClick={() => audioInputRef.current?.click()}
          className={`flex h-56 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface px-6 text-center transition ${audioBorder}`}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <IconCloudUpload size={20} className="text-primary" />
          </div>
          <Text className="mb-1 text-sm font-medium text-text">
            {audioName ?? "Drop audio file here"}
          </Text>
          <Text className="mb-4 text-xs text-text/40">
            WAV or MP3, up to 250MB
          </Text>
          <span className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary">
            Browse files
          </span>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*,.mp3,.wav"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onPickAudio(file);
              }
              event.target.value = "";
            }}
          />
        </button>
        {audioError !== null ? (
          <Text className="mt-1.5 text-sm text-danger">{audioError}</Text>
        ) : null}
      </div>

      {peaksProgress !== null ? (
        <div className="rounded-2xl border border-white/5 bg-surface p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Text className="text-sm text-text/80">
              {peaksProgress < 100 ? "Generating peaks…" : "Peaks ready"}
            </Text>
            <Text className="truncate text-xs text-text/40">{audioName}</Text>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-page">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${peaksProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div>
        <button
          type="button"
          onClick={() => artworkInputRef.current?.click()}
          className={`flex h-56 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-surface text-center transition ${artworkBorder}`}
        >
          {artworkPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artworkPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <IconPhoto size={20} className="text-primary" />
              </div>
              <Text className="mb-1 text-sm font-medium text-text">
                Drop cover art here
              </Text>
              <Text className="mb-4 text-xs text-text/40">
                JPG or PNG — crop square after you pick
              </Text>
              <span className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary">
                Browse files
              </span>
            </>
          )}
          <input
            ref={artworkInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onPickArtwork(file);
              }
              event.target.value = "";
            }}
          />
        </button>
        {artworkError !== null ? (
          <Text className="mt-1.5 text-sm text-danger">{artworkError}</Text>
        ) : null}
      </div>
    </div>
  );
};

export default UploadMediaColumn;
