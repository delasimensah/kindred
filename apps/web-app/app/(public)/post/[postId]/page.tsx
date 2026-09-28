"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";

import PublicPostPage from "@/components/pages/PublicPostPage/PublicPostPage";
import PublicPostPageSkeleton from "@/components/pages/PublicPostPage/PublicPostPageSkeleton";
import { playVoice } from "@/components/public/playPublicAudio";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";

const PublicPostRoute = () => {
  const params = useParams<{ postId: string }>();
  const post = useQuery(api.publicPages.post, { postId: params.postId });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (post === undefined) {
    return <PublicPostPageSkeleton />;
  }
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
