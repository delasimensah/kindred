"use client";

import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import React from "react";

import PublicArtistPage from "@/components/pages/PublicArtistPage/PublicArtistPage";
import PublicArtistPageSkeleton from "@/components/pages/PublicArtistPage/PublicArtistPageSkeleton";
import { playTrackList } from "@/components/public/playPublicAudio";
import PublicLoadFailed from "@/components/public/PublicLoadFailed";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";
import { useRetryKey, useScreenQuery } from "@/hooks";

const PublicArtistRoute = () => {
  const params = useParams<{ handle: string }>();
  const { retryKey, onRetry } = useRetryKey();
  return (
    <PublicArtistQuery
      key={retryKey}
      handle={params.handle}
      onRetry={onRetry}
    />
  );
};

const PublicArtistQuery: React.FC<{
  handle: string;
  onRetry: () => void;
}> = ({ handle, onRetry }) => {
  const state = useScreenQuery(api.publicPages.artist, {
    handle,
  });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (state.status === "error") {
    return <PublicLoadFailed onRetry={onRetry} />;
  }
  if (state.status === "pending") {
    return <PublicArtistPageSkeleton />;
  }
  const artist = state.data;
  if (artist === null) {
    return <PublicMissing />;
  }
  return (
    <PublicArtistPage
      artist={artist}
      activeTrackId={current?.kind === "track" ? current.id : null}
      playing={playing}
      onPlayTrack={playTrackList}
    />
  );
};

export default PublicArtistRoute;
