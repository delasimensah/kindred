import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useConvex } from "convex/react";
import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
} from "expo-audio";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { usePlaybackControls } from "./playbackControls";
import {
  applyPlayable,
  currentTrack,
  cycleRepeat,
  emptyQueue,
  moveUpcoming,
  type PlaybackQueue,
  type PreviewTrack,
  type QueueTrack,
  removeUpcoming,
  type RepeatMode,
  setShuffle as shuffleQueue,
  STAND_IN_TRACK_ID,
  upcomingIndexes,
} from "./playbackQueue";
import { usePlaybackPersistence } from "./playbackSession";

export type { PreviewTrack, QueueTrack, RepeatMode };

interface PreviewPlayerValue {
  track: PreviewTrack;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  progress: number;
  positionMs: number;
  durationMs: number;
  upcoming: QueueTrack[];
  play: (track: PreviewTrack, queue?: PreviewTrack[]) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (ratio: number) => void;
  setShuffle: (enabled: boolean) => void;
  cycleRepeat: () => void;
  playNext: (track: PreviewTrack) => void;
  addToQueue: (track: PreviewTrack) => void;
  removeUpcoming: (slot: number) => void;
  moveUpcoming: (fromSlot: number, toSlot: number) => void;
  ready: boolean;
}

const PreviewPlayerContext = createContext<PreviewPlayerValue | null>(null);

const STAND_IN: PreviewTrack = {
  trackId: STAND_IN_TRACK_ID,
  title: "Asase",
  artistName: "Amaara Mensah",
};

const LISTEN_AFTER_SECONDS = 30;

export function PreviewPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const convex = useConvex();
  const [audio] = useState(() =>
    createAudioPlayer(null, { keepAudioSessionActive: true })
  );
  const status = useAudioPlayerStatus(audio);
  const [queue, setQueue] = useState<PlaybackQueue>(emptyQueue);
  const [isPlaying, setIsPlaying] = useState(false);
  const queueRef = useRef(queue);
  const statusRef = useRef(status);
  const loadedId = useRef<string | null>(null);
  const request = useRef(0);
  const sawNativeStatus = useRef(false);
  const finished = useRef(false);
  const listenId = useRef<string | null>(null);
  const listenStarted = useRef(0);
  const recorded = useRef<string | null>(null);
  const resumeAt = useRef<number | null>(null);
  const seekArm = useRef<{
    trackId: string;
    seconds: number;
    sawUnload: boolean;
  } | null>(null);
  const listenFloor = useRef(0);
  const accessRequest = useRef(0);
  const controls = usePlaybackControls({
    audio,
    convex,
    isPlaying,
    queueRef,
    statusRef,
    loadedIdRef: loadedId,
    requestRef: request,
    listenIdRef: listenId,
    listenStartedRef: listenStarted,
    recordedRef: recorded,
    resumeAtRef: resumeAt,
    seekArmRef: seekArm,
    listenFloorRef: listenFloor,
    setIsPlaying,
    setQueue,
  });
  const ready = usePlaybackPersistence({
    audio,
    queue,
    queueRef,
    setQueue,
    status,
    isPlaying,
    loadedIdRef: loadedId,
    resumeAtRef: resumeAt,
    seekArmRef: seekArm,
    listenFloorRef: listenFloor,
    start: controls.start,
  });

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const playing = currentTrack(queue) ?? STAND_IN;
  const accessKey = queue.tracks.map((track) => track.trackId).join("|");

  useEffect(() => {
    // https://docs.expo.dev/versions/v57.0.0/sdk/audio/
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
    return () => {
      audio.clearLockScreenControls();
      audio.remove();
    };
  }, [audio]);

  useEffect(() => {
    if (!sawNativeStatus.current) {
      sawNativeStatus.current = true;
      return;
    }
    setIsPlaying(status.playing);
  }, [status.playing]);

  useEffect(() => {
    if (!status.didJustFinish) {
      finished.current = false;
      return;
    }
    if (finished.current) {
      return;
    }
    finished.current = true;
    controls.next();
  }, [controls, status.didJustFinish]);

  useEffect(() => {
    const ids = accessKey.split("|").filter((id) => id.length > 0);
    if (ids.length === 0) {
      return;
    }
    const ticket = accessRequest.current + 1;
    accessRequest.current = ticket;
    void convex
      .query(api.player.resolveQueueAccess, {
        trackIds: ids as Id<"tracks">[],
      })
      .then((rows) => {
        if (ticket !== accessRequest.current || !Array.isArray(rows)) {
          return;
        }
        setQueue((current) => {
          const nextQueue = applyPlayable(current, rows);
          queueRef.current = nextQueue;
          return nextQueue;
        });
      })
      .catch(() => undefined);
  }, [accessKey, convex]);

  useEffect(() => {
    const eventId = listenId.current;
    const row = currentTrack(queueRef.current);
    if (
      eventId === null ||
      recorded.current === eventId ||
      row === null ||
      (row.artistId ?? "").length === 0 ||
      (status.currentTime ?? 0) - listenFloor.current < LISTEN_AFTER_SECONDS
    ) {
      return;
    }
    recorded.current = eventId;
    void convex
      .mutation(api.listen.record, {
        trackId: row.trackId as Id<"tracks">,
        artistId: row.artistId as Id<"artists">,
        startedAt: listenStarted.current,
        msPlayed: Math.round((status.currentTime ?? 0) * 1000),
        completed:
          status.duration > 0 && status.currentTime >= status.duration - 1,
        source: row.source,
        clientEventId: eventId,
      })
      .catch(() => {
        if (recorded.current === eventId) {
          recorded.current = null;
        }
      });
  }, [convex, queue, status.currentTime, status.duration]);

  const durationMs =
    status.duration > 0
      ? status.duration * 1000
      : (currentTrack(queue)?.durationMs ?? 0);
  const positionMs = Math.max(0, (status.currentTime ?? 0) * 1000);

  return (
    <PreviewPlayerContext.Provider
      value={{
        track: playing,
        isPlaying,
        shuffle: queue.shuffle,
        repeat: queue.repeat,
        progress: durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0,
        positionMs,
        durationMs,
        upcoming: upcomingIndexes(queue).flatMap((index) => {
          const item = queue.tracks[index];
          return item === undefined ? [] : [item];
        }),
        play: controls.play,
        toggle: controls.toggle,
        next: controls.next,
        previous: controls.previous,
        seek: controls.seek,
        setShuffle: (enabled) => {
          setQueue((current) => {
            const nextQueue = shuffleQueue(current, enabled);
            queueRef.current = nextQueue;
            return nextQueue;
          });
        },
        cycleRepeat: () => {
          setQueue((current) => {
            const nextQueue = cycleRepeat(current);
            queueRef.current = nextQueue;
            return nextQueue;
          });
        },
        playNext: controls.playNext,
        addToQueue: controls.addToQueue,
        removeUpcoming: (slot) => {
          setQueue((current) => {
            const nextQueue = removeUpcoming(current, slot);
            queueRef.current = nextQueue;
            return nextQueue;
          });
        },
        moveUpcoming: (fromSlot, toSlot) => {
          setQueue((current) => {
            const nextQueue = moveUpcoming(current, fromSlot, toSlot);
            queueRef.current = nextQueue;
            return nextQueue;
          });
        },
        ready,
      }}
    >
      {children}
    </PreviewPlayerContext.Provider>
  );
}

export function usePreviewPlayer(): PreviewPlayerValue {
  const value = useContext(PreviewPlayerContext);
  if (value === null) {
    throw new Error("Preview player is missing");
  }
  return value;
}
