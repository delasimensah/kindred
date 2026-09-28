"use client";

import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import React from "react";

import PublicPostPage from "@/components/pages/PublicPostPage/PublicPostPage";
import PublicPostPageSkeleton from "@/components/pages/PublicPostPage/PublicPostPageSkeleton";
import { playVoice } from "@/components/public/playPublicAudio";
import PublicLoadFailed from "@/components/public/PublicLoadFailed";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";
import { useRetryKey, useScreenQuery } from "@/hooks";

const PublicPostRoute = () => {
  const params = useParams<{ postId: string }>();
  const { retryKey, onRetry } = useRetryKey();
  return (
    <PublicPostQuery key={retryKey} postId={params.postId} onRetry={onRetry} />
  );
};

const PublicPostQuery: React.FC<{ postId: string; onRetry: () => void }> = ({
  postId,
  onRetry,
}) => {
  const state = useScreenQuery(api.publicPages.post, {
    postId,
  });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (state.status === "error") {
    return <PublicLoadFailed onRetry={onRetry} />;
  }
  if (state.status === "pending") {
    return <PublicPostPageSkeleton />;
  }
  const post = state.data;
  if (post === null) {
    return <PublicMissing />;
  }
  return (
    <PublicPostPage
      post={post}
      voicePlaying={
        playing && current?.kind === "voice" && current.id === post.postId
      }
      onPlayVoice={() => {
        if (!post.hasVoice || post.voiceDurationMs === null) {
          return;
        }
        playVoice({
          kind: "voice",
          id: post.postId,
          title: "Voice note",
          artistName: post.artistName,
          artworkUrl: post.avatarUrl,
          durationMs: post.voiceDurationMs,
        });
      }}
    />
  );
};

export default PublicPostRoute;
