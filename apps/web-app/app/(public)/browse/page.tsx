"use client";

import { api } from "@convex/_generated/api";
import React from "react";

import PublicBrowsePage from "@/components/pages/PublicBrowsePage/PublicBrowsePage";
import PublicBrowsePageSkeleton from "@/components/pages/PublicBrowsePage/PublicBrowsePageSkeleton";
import { playTrackList } from "@/components/public/playPublicAudio";
import type { PublicTrackItem } from "@/components/public/publicCatalog";
import PublicLoadFailed from "@/components/public/PublicLoadFailed";
import { useRetryKey, useScreenQuery } from "@/hooks";

const PublicBrowseRoute = () => {
  const { retryKey, onRetry } = useRetryKey();
  return <PublicBrowseQuery key={retryKey} onRetry={onRetry} />;
};

const PublicBrowseQuery: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const state = useScreenQuery(api.publicPages.browse, {});

  if (state.status === "error") {
    return <PublicLoadFailed onRetry={onRetry} />;
  }
  if (state.status === "pending") {
    return <PublicBrowsePageSkeleton />;
  }

  const browse = state.data;

  const featured = browse.featured;
  const onPlayTrack = (trackId: string) => {
    if (featured === null) {
      return;
    }
    const tracks: PublicTrackItem[] = featured.playTracks.map((track) => ({
      trackId: track.trackId,
      title: track.title,
      artistId: featured.handle,
      artistName: featured.name,
      artistHandle: featured.handle,
      artworkUrl: track.artworkUrl,
      durationMs: track.durationMs,
      locked: false,
      kindLabel: "Single",
    }));
    playTrackList(tracks, trackId);
  };

  return (
    <PublicBrowsePage
      featured={featured}
      rising={browse.rising}
      releases={browse.releases}
      onPlayTrack={onPlayTrack}
    />
  );
};

export default PublicBrowseRoute;
