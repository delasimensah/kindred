"use client";

import {
  IconMicrophone,
  IconPhoto,
  IconPlayerStop,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React, { useRef } from "react";

import { formatVoiceDuration } from "@/utils";

import Text from "../../ui/Text/Text";

interface ComposerAttachmentsProps {
  photoName: string | null;
  photoPreviewUrl: string | null;
  onPickPhoto: (file: File) => void;
  onClearPhoto: () => void;
  voiceSupported: boolean;
  voiceUnsupportedReason: string | null;
  isRecording: boolean;
  recordingMs: number;
  voiceLabel: string | null;
  onToggleRecord: () => void;
  onClearVoice: () => void;
}

const ComposerAttachments: React.FC<ComposerAttachmentsProps> = ({
  photoName,
  photoPreviewUrl,
  onPickPhoto,
  onClearPhoto,
  voiceSupported,
  voiceUnsupportedReason,
  isRecording,
  recordingMs,
  voiceLabel,
  onToggleRecord,
  onClearVoice,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-5 sm:p-7">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text/80">
        Attach
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative">
          {photoPreviewUrl ? (
            <div className="relative flex h-40 flex-col overflow-hidden rounded-xl border border-white/10 bg-page">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreviewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-page/90 px-3 py-2">
                <Text className="truncate text-xs text-text/70">
                  {photoName ?? "Photo"}
                </Text>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={onClearPhoto}
                  className="rounded-lg p-1 text-text/50 hover:bg-white/10 hover:text-text"
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-page px-4 text-center transition hover:border-primary/50"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <IconPhoto size={18} className="text-primary" aria-hidden />
              </div>
              <p className="mb-1 text-sm font-medium text-text">Add photo</p>
              <p className="text-xs text-text/40">JPG or PNG, up to 10MB</p>
            </button>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onPickPhoto(file);
              }
              event.target.value = "";
            }}
          />
        </div>

        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-white/10 bg-page px-4 text-center">
          {!voiceSupported ? (
            <>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                <IconMicrophone
                  size={18}
                  className="text-text/30"
                  aria-hidden
                />
              </div>
              <p className="mb-1 text-sm font-medium text-text/50">
                Voice note unavailable
              </p>
              <p className="text-xs text-text/35">
                {voiceUnsupportedReason ??
                  "Use text or a photo in this browser."}
              </p>
            </>
          ) : voiceLabel ? (
            <>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <IconMicrophone
                  size={18}
                  className="text-primary"
                  aria-hidden
                />
              </div>
              <p className="mb-1 text-sm font-medium text-text">{voiceLabel}</p>
              <button
                type="button"
                onClick={onClearVoice}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-text/50 hover:text-text"
              >
                <IconTrash size={12} /> Remove
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-label={
                  isRecording ? "Stop recording" : "Start recording voice note"
                }
                onClick={onToggleRecord}
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition hover:bg-primary/20"
              >
                {isRecording ? (
                  <IconPlayerStop size={18} className="text-primary" />
                ) : (
                  <IconMicrophone size={18} className="text-primary" />
                )}
              </button>
              <p className="mb-1 text-sm font-medium text-text">
                {isRecording ? "Recording…" : "Record voice note"}
              </p>
              <p className="text-xs text-text/40">
                {isRecording
                  ? formatVoiceDuration(recordingMs)
                  : "Tap to start recording"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComposerAttachments;
