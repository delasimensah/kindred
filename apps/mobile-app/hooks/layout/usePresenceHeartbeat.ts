import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { ConvexReactClient } from "convex/react";
import { type RefObject, useEffect } from "react";
import { PRESENCE_HEARTBEAT_MS } from "shared";

import {
  currentTrack,
  type PlaybackQueue,
  STAND_IN_TRACK_ID,
} from "./playbackQueue";

/**
 * While audio is playing, send a presence heartbeat now and every 20s.
 * Paused means no beats. Spike only — no presence UI yet (KIND-59).
 */
export function usePresenceHeartbeat({
  convex,
  isPlaying,
  queueRef,
  trackKey,
}: {
  convex: ConvexReactClient;
  isPlaying: boolean;
  queueRef: RefObject<PlaybackQueue>;
  trackKey: string;
}): void {
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let timer: ReturnType<typeof setInterval> | null = null;

    const send = () => {
      const row = currentTrack(queueRef.current);
      if (
        row === null ||
        row.artistId.length === 0 ||
        row.trackId.length === 0 ||
        row.trackId === STAND_IN_TRACK_ID
      ) {
        return;
      }
      void convex
        .mutation(api.presence.heartbeat, {
          artistId: row.artistId as Id<"artists">,
          trackId: row.trackId as Id<"tracks">,
        })
        .catch(() => undefined);
    };

    send();
    timer = setInterval(send, PRESENCE_HEARTBEAT_MS);

    return () => {
      if (timer !== null) {
        clearInterval(timer);
      }
    };
  }, [convex, isPlaying, queueRef, trackKey]);
}
