"use client";

import { api } from "@convex/_generated/api";
import { useConvex } from "convex/react";

import { useStudioSession } from "@/hooks";

import {
  type PublicQueueItem,
  usePublicPlayer,
} from "../../public/publicPlayerStore";
import type { ListRow } from "./ReleaseRow";

/**
 * A single queues every single in the visible list from that row on.
 * An album or EP queues its own tracks in order.
 */
export function useReleasePlayback() {
  const convex = useConvex();
  const { displayName } = useStudioSession();
  const activeKey = usePublicPlayer(
    (state) => state.queue[state.index]?.groupId ?? null
  );
  const playing = usePublicPlayer((state) => state.playing);

  const play = async (row: ListRow, visible: ListRow[]) => {
    const player = usePublicPlayer.getState();
    if (activeKey === row.key) {
      player.toggle();
      return;
    }
    if (row.kind === "single") {
      const singles = visible.filter(
        (item) => item.kind === "single" && item.trackId !== undefined
      );
      const queue: PublicQueueItem[] = singles.map((item) => ({
        kind: "track",
        id: item.trackId ?? "",
        title: item.title,
        artistName: displayName,
        artworkUrl: item.artworkUrl,
        durationMs: item.durationMs,
        groupId: item.key,
      }));
      player.play(
        queue,
        singles.findIndex((item) => item.key === row.key)
      );
      return;
    }
    if (row.releaseId === undefined) {
      return;
    }
    const album = await convex.query(api.studioReleases.getMine, {
      releaseId: row.releaseId,
    });
    if (album === null) {
      return;
    }
    const tracks = [...album.tracks].sort((a, b) => a.position - b.position);
    player.play(
      tracks.map((track) => ({
        kind: "track",
        id: track.trackId,
        title: track.title,
        artistName: displayName,
        artworkUrl: album.artworkUrl,
        durationMs: track.durationMs,
        groupId: row.key,
      })),
      0
    );
  };

  return { activeKey, playing, play };
}
