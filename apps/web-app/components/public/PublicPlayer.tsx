"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React, { useEffect, useRef } from "react";

import PublicPlayerBar from "./PublicPlayerBar";
import { usePublicPlayer } from "./publicPlayerStore";

const PublicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const queue = usePublicPlayer((state) => state.queue);
  const index = usePublicPlayer((state) => state.index);
  const playing = usePublicPlayer((state) => state.playing);
  const positionMs = usePublicPlayer((state) => state.positionMs);
  const generation = usePublicPlayer((state) => state.generation);
  const current = queue[index];
  const playback = useQuery(
    api.publicPages.playbackUrl,
    current?.kind === "track" ? { trackId: current.id as Id<"tracks"> } : "skip"
  );
  const voice = useQuery(
    api.publicPages.voiceUrl,
    current?.kind === "voice"
      ? { postId: current.id as Id<"updatePosts"> }
      : "skip"
  );
  const source = current?.kind === "track" ? playback : voice;
  const url = source?.audioUrl ?? null;

  useEffect(() => {
    if (current !== undefined && source === null && playing) {
      usePublicPlayer.getState().pause();
    }
  }, [current, source, playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || current === undefined || url === null) {
      return;
    }
    const key = `${generation}:${current.kind}:${current.id}`;
    if (audio.dataset.queueKey !== key) {
      audio.dataset.queueKey = key;
      audio.src = url;
      audio.currentTime = 0;
    }
  }, [url, current, generation]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || url === null) {
      return;
    }
    if (playing) {
      void audio.play().catch(() => {
        if (usePublicPlayer.getState().playing) {
          usePublicPlayer.getState().pause();
        }
      });
      return;
    }
    audio.pause();
  }, [playing, url, generation]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio === null) {
      return;
    }
    const onTime = () => {
      usePublicPlayer.getState().setPosition(audio.currentTime * 1000);
    };
    const onEnded = () => {
      usePublicPlayer.getState().next();
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  if (current === undefined) {
    return <audio ref={audioRef} preload="none" className="hidden" />;
  }

  return (
    <>
      <audio ref={audioRef} preload="none" className="hidden" />
      <PublicPlayerBar
        title={current.title}
        artistName={current.artistName}
        artworkUrl={current.artworkUrl}
        positionMs={positionMs}
        durationMs={current.durationMs}
        playing={playing}
        canNext={index < queue.length - 1}
        onToggle={() => usePublicPlayer.getState().toggle()}
        onPrevious={() => usePublicPlayer.getState().previous()}
        onNext={() => usePublicPlayer.getState().next()}
        onSeek={(nextPosition) => {
          const audio = audioRef.current;
          if (audio !== null && url !== null) {
            audio.currentTime = nextPosition / 1000;
          }
          usePublicPlayer.getState().setPosition(nextPosition);
        }}
      />
    </>
  );
};

export default PublicPlayer;
