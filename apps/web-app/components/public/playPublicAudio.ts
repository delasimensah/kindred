"use client";

import { playableTracks, type PublicTrackItem } from "./publicCatalog";
import type { PublicQueueItem } from "./publicPlayerStore";
import { usePublicPlayer } from "./publicPlayerStore";

function toQueueItem(track: PublicTrackItem): PublicQueueItem {
  return {
    kind: "track",
    id: track.trackId,
    title: track.title,
    artistName: track.artistName,
    artworkUrl: track.artworkUrl,
    durationMs: track.durationMs,
  };
}

export function playTrackList(tracks: PublicTrackItem[], trackId: string) {
  const player = usePublicPlayer.getState();
  const current = player.queue[player.index];
  if (current?.kind === "track" && current.id === trackId) {
    player.toggle();
    return;
  }
  const playable = playableTracks(tracks);
  const index = playable.findIndex((track) => track.trackId === trackId);
  const first = playable[index];
  if (first === undefined) {
    return;
  }
  player.play(playable.map(toQueueItem), index);
}

export function playVoice(item: PublicQueueItem) {
  const player = usePublicPlayer.getState();
  const current = player.queue[player.index];
  if (current?.kind === "voice" && current.id === item.id) {
    player.toggle();
    return;
  }
  player.play([item], 0);
}
