"use client";

import { IconGlobe, IconHeart, IconMicrophone } from "@tabler/icons-react";
import React from "react";

import Text from "../../ui/Text/Text";

interface ComposerPreviewProps {
  artistName: string;
  avatarUrl: string | null;
  body: string;
  audience: "everyone" | "supporters";
  photoPreviewUrl: string | null;
  voiceLabel: string | null;
}

const ComposerPreview: React.FC<ComposerPreviewProps> = ({
  artistName,
  avatarUrl,
  body,
  audience,
  photoPreviewUrl,
  voiceLabel,
}) => {
  const isEveryone = audience === "everyone";

  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-text/80">
        Preview
      </h2>
      <div className="rounded-xl border border-white/5 bg-page p-5">
        <div className="mb-3 flex items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {artistName.slice(0, 1).toUpperCase() || "K"}
            </div>
          )}
          <div className="min-w-0">
            <Text className="truncate text-sm font-medium text-text">
              {artistName}
            </Text>
            <Text className="text-xs text-text/40">Just now</Text>
          </div>
        </div>
        <Text className="mb-3 whitespace-pre-wrap text-sm text-text/70">
          {body.trim().length > 0
            ? body
            : "Your update text will appear here as you type…"}
        </Text>
        {photoPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoPreviewUrl}
            alt=""
            className="mb-3 max-h-48 w-full rounded-lg object-cover"
          />
        ) : null}
        {voiceLabel ? (
          <Text className="mb-3 inline-flex items-center gap-1.5 text-xs text-text/45">
            <IconMicrophone size={12} aria-hidden />
            {voiceLabel}
          </Text>
        ) : null}
        <span
          className={
            isEveryone
              ? "inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary"
              : "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-text/60"
          }
        >
          {isEveryone ? (
            <IconGlobe size={12} aria-hidden />
          ) : (
            <IconHeart size={12} className="text-primary" aria-hidden />
          )}
          {isEveryone ? "Everyone" : "Supporters only"}
        </span>
      </div>
      <Text className="mt-4 text-xs leading-relaxed text-text/35">
        This is how your update will look on your public page and in supporter
        feeds.
      </Text>
    </div>
  );
};

export default ComposerPreview;
