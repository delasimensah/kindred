"use client";

import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import React from "react";

import PublicTrackPage from "@/components/pages/PublicTrackPage/PublicTrackPage";
import PublicTrackPageSkeleton from "@/components/pages/PublicTrackPage/PublicTrackPageSkeleton";
import { playTrackList } from "@/components/public/playPublicAudio";
import PublicLoadFailed from "@/components/public/PublicLoadFailed";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";
import { useRetryKey, useScreenQuery } from "@/hooks";

const PublicTrackRoute = () => {
  const params = useParams<{ trackId: string }>();
  const { retryKey, onRetry } = useRetryKey();
  return (
    <PublicTrackQuery
      key={retryKey}
      trackId={params.trackId}
      onRetry={onRetry}
    />
  );
};

const PublicTrackQuery: React.FC<{
  trackId: string;
  onRetry: () => void;
}> = ({ trackId, onRetry }) => {
  const state = useScreenQuery(api.publicPages.track, {
    trackId,
  });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (state.status === "error") {
    return <PublicLoadFailed onRetry={onRetry} />;
  }
  if (state.status === "pending") {
    return <PublicTrackPageSkeleton />;
  }
  const page = state.data;
  if (page === null) {
    return <PublicMissing />;
  }
  return (
    <PublicTrackPage
      track={page.track}
      description={page.description}
      publishedAt={page.publishedAt}
      artistAvatarUrl={page.artistAvatarUrl}
      more={page.more}
      activeTrackId={current?.kind === "track" ? current.id : null}
      playing={playing}
      onPlayTrack={playTrackList}
    />
  );
};

export default PublicTrackRoute;
