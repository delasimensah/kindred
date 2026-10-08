"use client";

import { Button } from "@mantine/core";
import {
  IconGlobe,
  IconHeart,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useRef, useState } from "react";

import { formatRelativeTime, formatVoiceDuration } from "@/utils";

import Text from "../../ui/Text/Text";

export type StudioUpdateRow = {
  postId: string;
  createdAt: number;
  audience: "everyone" | "supporters";
  body: string;
  photoUrl: string | null;
  voiceDurationMs: number | null;
  voiceUrl: string | null;
  voicePeaks: number[];
};

interface UpdateListItemProps {
  post: StudioUpdateRow;
  artistName: string;
  avatarUrl: string | null;
  isDeleting?: boolean;
  onDelete: () => void;
}

const UpdateListItem: React.FC<UpdateListItemProps> = ({
  post,
  artistName,
  avatarUrl,
  isDeleting = false,
  onDelete,
}) => {
  const isEveryone = post.audience === "everyone";
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <article className="rounded-2xl border border-white/5 bg-surface p-5 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {artistName.slice(0, 1).toUpperCase() || "K"}
            </div>
          )}
          <div className="min-w-0">
            <Text className="truncate text-sm font-medium text-text">
              {artistName}
            </Text>
            <Text className="mt-0.5 text-xs text-text/40">
              {formatRelativeTime(post.createdAt)}
            </Text>
          </div>
        </div>
        <span
          className={
            isEveryone
              ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary"
              : "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-text/60"
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

      <Text className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-text/75">
        {post.body}
      </Text>

      {post.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.photoUrl}
          alt=""
          className="mb-4 max-h-80 w-full rounded-xl object-cover"
        />
      ) : null}

      {post.voiceUrl && post.voiceDurationMs !== null ? (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-page px-4 py-3">
          <button
            type="button"
            aria-label={playing ? "Pause voice note" : "Play voice note"}
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) {
                return;
              }
              if (audio.paused) {
                void audio.play();
                setPlaying(true);
              } else {
                audio.pause();
                setPlaying(false);
              }
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 hover:bg-primary/25"
          >
            {playing ? (
              <IconPlayerPause size={12} className="text-primary" aria-hidden />
            ) : (
              <IconPlayerPlay size={12} className="text-primary" aria-hidden />
            )}
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>
          <span className="text-xs text-text/40">
            {formatVoiceDuration(post.voiceDurationMs)}
          </span>
          <audio
            ref={audioRef}
            src={post.voiceUrl}
            preload="none"
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-white/5 pt-4">
        <Button
          component={Link}
          href={`/updates/compose?postId=${post.postId}`}
          variant="default"
          size="compact-sm"
          className="rounded-lg border-white/10 bg-transparent text-xs text-text/70"
        >
          Edit
        </Button>
        <Button
          variant="default"
          size="compact-sm"
          loading={isDeleting}
          onClick={onDelete}
          className="rounded-lg border-white/10 bg-transparent text-xs text-danger"
        >
          Delete
        </Button>
      </div>
    </article>
  );
};

export default UpdateListItem;
