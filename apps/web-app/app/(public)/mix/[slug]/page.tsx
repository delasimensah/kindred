"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";

import PublicMixPage from "@/components/pages/PublicMixPage/PublicMixPage";
import PublicMixPageSkeleton from "@/components/pages/PublicMixPage/PublicMixPageSkeleton";
import { playTrackList } from "@/components/public/playPublicAudio";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";

const PublicMixRoute = () => {
  const params = useParams<{ slug: string }>();
  const mix = useQuery(api.publicPages.mix, { slug: params.slug });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (mix === undefined) {
    return <PublicMixPageSkeleton />;
  }
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
