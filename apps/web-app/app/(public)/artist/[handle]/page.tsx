"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";

import PublicArtistPage from "@/components/pages/PublicArtistPage/PublicArtistPage";
import PublicArtistPageSkeleton from "@/components/pages/PublicArtistPage/PublicArtistPageSkeleton";
import { playTrackList } from "@/components/public/playPublicAudio";
import PublicMissing from "@/components/public/PublicMissing";
import { usePublicPlayer } from "@/components/public/publicPlayerStore";

const PublicArtistRoute = () => {
  const params = useParams<{ handle: string }>();
  const artist = useQuery(api.publicPages.artist, {
    handle: params.handle,
  });
  const current = usePublicPlayer((state) => state.queue[state.index]);
  const playing = usePublicPlayer((state) => state.playing);

  if (artist === undefined) {
    return <PublicArtistPageSkeleton />;
  }
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
