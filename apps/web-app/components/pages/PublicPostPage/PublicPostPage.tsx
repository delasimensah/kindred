"use client";

import {
  IconLock,
  IconPlayerPause,
  IconPlayerPlay,
  IconShare,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { formatRelativeTime, formatVoiceDuration } from "@/utils";

import GetTheAppButton from "../../public/GetTheAppButton";
import { Artwork } from "../../public/PublicTrackRow";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

export interface PublicPost {
  postId: string;
  artistName: string;
  artistHandle: string;
  avatarUrl: string | null;
  createdAt: number;
  locked: boolean;
  body: string | null;
  photoUrl: string | null;
  hasVoice: boolean;
  voiceDurationMs: number | null;
}

const VOICE_BARS = [2, 4, 3, 5, 2, 6, 3, 4, 2, 5, 3, 4, 2, 3];

function copyPageLink() {
  void navigator.clipboard.writeText(window.location.href);
}

interface PublicPostPageProps {
  post: PublicPost;
  voicePlaying: boolean;
  onPlayVoice: () => void;
}

const PublicPostPage: React.FC<PublicPostPageProps> = ({
  post,
  voicePlaying,
  onPlayVoice,
}) => {
  return (
    <main className="mx-auto max-w-[720px] space-y-8 px-4 py-10 sm:px-8 lg:px-10 lg:py-12">
      <Link
        href={`/artist/${post.artistHandle}`}
        className="flex w-fit items-center gap-3"
      >
        <Artwork url={post.avatarUrl} className="h-11 w-11 rounded-full" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{post.artistName}</p>
          <p className="text-xs text-text/45">
            {post.locked
              ? "Exclusive"
              : `Public update · ${formatRelativeTime(post.createdAt)}`}
          </p>
        </div>
      </Link>
      {post.locked ? (
        <article className="overflow-hidden rounded-2xl border border-primary/20 bg-surface">
          <div className="p-6 sm:p-7">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <IconLock size={10} aria-hidden />
              Exclusive
            </p>
            <Heading variant="section" className="mb-2 text-xl">
              Supporters only
            </Heading>
            <Text className="text-sm leading-relaxed text-text/50">
              Available for supporters in the Kindred app.
            </Text>
          </div>
          <div className="mt-6 flex h-64 flex-col items-center justify-center gap-4 bg-page/60 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
              <IconLock size={18} className="text-text/70" aria-hidden />
            </div>
            <p className="max-w-[260px] text-sm text-text/60">
              This post is exclusive to supporters. Get the app to unlock it.
            </p>
            <GetTheAppButton className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary" />
          </div>
        </article>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
          <div className="p-6 sm:p-7">
            <Text className="text-sm leading-relaxed text-text/70">
              {post.body}
            </Text>
            {post.hasVoice && post.voiceDurationMs !== null ? (
              <button
                type="button"
                aria-label={
                  voicePlaying ? "Pause voice note" : "Play voice note"
                }
                onClick={onPlayVoice}
                className="mt-5 flex w-full items-center gap-4 rounded-xl border border-white/10 bg-page px-5 py-4 text-left"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-textOnPrimary">
                  {voicePlaying ? (
                    <IconPlayerPause size={12} />
                  ) : (
                    <IconPlayerPlay size={12} className="ml-0.5" />
                  )}
                </span>
                <span
                  className="flex h-6 flex-1 items-center gap-0.5"
                  aria-hidden
                >
                  {VOICE_BARS.map((height, index) => (
                    <span
                      key={index}
                      className="w-1 rounded-full bg-text/25"
                      style={{ height: `${height * 4}px` }}
                    />
                  ))}
                </span>
                <span className="shrink-0 text-xs text-text/40">
                  {formatVoiceDuration(post.voiceDurationMs)}
                </span>
              </button>
            ) : null}
          </div>
          {post.photoUrl !== null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.photoUrl}
              alt=""
              className="h-64 w-full object-cover sm:h-80"
            />
          ) : null}
          <div className="flex items-center border-t border-white/5 px-6 py-5 sm:px-7">
            <button
              type="button"
              onClick={copyPageLink}
              className="ml-auto flex items-center gap-2 text-sm text-text/60 hover:text-text"
            >
              <IconShare size={16} />
              Share
            </button>
          </div>
        </article>
      )}
    </main>
  );
};

export default PublicPostPage;
