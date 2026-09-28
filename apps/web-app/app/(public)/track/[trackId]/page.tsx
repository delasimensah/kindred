"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";

import PublicTrackPage from "@/components/pages/PublicTrackPage/PublicTrackPage";
import PublicTrackPageSkeleton from "@/components/pages/PublicTrackPage/PublicTrackPageSkeleton";
import { playTrackList } from "@/components/public/playPublicAudio";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";

const PublicTrackRoute = () => {
  const params = useParams<{ trackId: string }>();
  const page = useQuery(api.publicPages.track, { trackId: params.trackId });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (page === undefined) {
    return <PublicTrackPageSkeleton />;
  }
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
