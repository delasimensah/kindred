"use client";

import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import React from "react";

import PublicMixPage from "@/components/pages/PublicMixPage/PublicMixPage";
import PublicMixPageSkeleton from "@/components/pages/PublicMixPage/PublicMixPageSkeleton";
import { playTrackList } from "@/components/public/playPublicAudio";
import PublicLoadFailed from "@/components/public/PublicLoadFailed";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";
import { useRetryKey, useScreenQuery } from "@/hooks";

const PublicMixRoute = () => {
  const params = useParams<{ slug: string }>();
  const { retryKey, onRetry } = useRetryKey();
  return <PublicMixQuery key={retryKey} slug={params.slug} onRetry={onRetry} />;
};

const PublicMixQuery: React.FC<{ slug: string; onRetry: () => void }> = ({
  slug,
  onRetry,
}) => {
  const state = useScreenQuery(api.publicPages.mix, {
    slug,
  });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (state.status === "error") {
    return <PublicLoadFailed onRetry={onRetry} />;
  }
  if (state.status === "pending") {
    return <PublicMixPageSkeleton />;
  }
  const mix = state.data;
  if (mix === null) {
    return <PublicMissing />;
  }
  return (
    <PublicMixPage
      mix={mix}
      activeTrackId={current?.kind === "track" ? current.id : null}
      playing={playing}
      onPlayTrack={playTrackList}
    />
  );
};

export default PublicMixRoute;
