import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { useConvex } from "convex/react";
import type { AudioPlayer, AudioStatus } from "expo-audio";
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  appendTrack,
  currentTrack,
  insertNext,
  jumpToUpcoming,
  type PlaybackQueue,
  type PreviewTrack,
  type QueueTrack,
  replaceQueue,
  soloQueue,
  STAND_IN_TRACK_ID,
  stepNext,
  stepPrevious,
} from "./playbackQueue";
import type { SeekArm } from "./playbackSession";

type Convex = ReturnType<typeof useConvex>;

interface PlaybackControlsInput {
  audio: AudioPlayer;
  convex: Convex;
  isPlaying: boolean;
  queueRef: RefObject<PlaybackQueue>;
  statusRef: RefObject<AudioStatus>;
  loadedIdRef: RefObject<string | null>;
  requestRef: RefObject<number>;
  listenIdRef: RefObject<string | null>;
  listenStartedRef: RefObject<number>;
  recordedRef: RefObject<string | null>;
  resumeAtRef: RefObject<number | null>;
  seekArmRef: RefObject<SeekArm | null>;
  listenFloorRef: RefObject<number>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  setQueue: Dispatch<SetStateAction<PlaybackQueue>>;
  setQueueEpoch: Dispatch<SetStateAction<number>>;
}

function stampListen(trackId: string) {
  const startedAt = Date.now();
  return { id: `${trackId}:${startedAt}`, startedAt };
}

export function usePlaybackControls({
  audio,
  convex,
  isPlaying,
  queueRef,
  statusRef,
  loadedIdRef,
  requestRef,
  listenIdRef,
  listenStartedRef,
  recordedRef,
  resumeAtRef,
  seekArmRef,
  listenFloorRef,
  setIsPlaying,
  setQueue,
  setQueueEpoch,
}: PlaybackControlsInput) {
  const startRef = useRef<(track: QueueTrack) => void>(() => undefined);

  const start = useCallback(
    (next: QueueTrack) => {
      const ticket = requestRef.current + 1;
      requestRef.current = ticket;
      const resumeSeconds = resumeAtRef.current;
      resumeAtRef.current = null;
      const heldSeconds = resumeSeconds;
      if (heldSeconds !== null) {
        listenIdRef.current = null;
        recordedRef.current = null;
        listenFloorRef.current = heldSeconds;
      } else {
        const listen = stampListen(next.trackId);
        listenIdRef.current = listen.id;
        listenStartedRef.current = listen.startedAt;
        recordedRef.current = null;
        listenFloorRef.current = 0;
        seekArmRef.current = null;
      }
      void convex
        .query(api.tracks.playbackUrl, {
          trackId: next.trackId as Id<"tracks">,
        })
        .then((row) => {
          if (ticket !== requestRef.current) {
            return;
          }
          if (row === null) {
            const stepped = stepNext({
              ...queueRef.current,
              tracks: queueRef.current.tracks.map((item) =>
                item.trackId === next.trackId ? { ...item, locked: true } : item
              ),
            });
            if (stepped.action !== "play") {
              setIsPlaying(false);
              audio.pause();
              return;
            }
            queueRef.current = stepped.queue;
            setQueue(stepped.queue);
            const follow = currentTrack(stepped.queue);
            if (follow !== null) {
              startRef.current(follow);
            }
            return;
          }
          setQueue((current) => {
            const nextQueue = {
              ...current,
              tracks: current.tracks.map((item) =>
                item.trackId === next.trackId
                  ? {
                      ...item,
                      artistId: row.artistId ?? item.artistId,
                      artistName: row.artistName,
                      title: row.title,
                      artworkUrl: row.artworkUrl ?? item.artworkUrl,
                      durationMs: row.durationMs ?? item.durationMs,
                      peaks: row.peaks ?? item.peaks,
                    }
                  : item
              ),
            };
            queueRef.current = nextQueue;
            return nextQueue;
          });
          audio.replace({ uri: row.audioUrl });
          audio.setActiveForLockScreen(
            true,
            {
              title: row.title,
              artist: row.artistName,
              artworkUrl: row.artworkUrl ?? undefined,
            },
            { showSeekForward: true, showSeekBackward: true }
          );
          loadedIdRef.current = next.trackId;
          if (heldSeconds !== null) {
            seekArmRef.current = {
              trackId: next.trackId,
              seconds: heldSeconds,
              sawUnload: !statusRef.current.isLoaded,
            };
            audio.pause();
            setIsPlaying(false);
            return;
          }
          audio.play();
        })
        .catch(() => {
          if (ticket === requestRef.current) {
            setIsPlaying(false);
          }
        });
    },
    [
      audio,
      convex,
      listenIdRef,
      listenStartedRef,
      loadedIdRef,
      queueRef,
      listenFloorRef,
      recordedRef,
      requestRef,
      resumeAtRef,
      seekArmRef,
      setIsPlaying,
      setQueue,
      statusRef,
    ]
  );

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const next = useCallback(() => {
    const stepped = stepNext(queueRef.current);
    if (stepped.action === "stop") {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    if (stepped.action === "replay") {
      void audio.seekTo(0);
      audio.play();
      setIsPlaying(true);
      return;
    }
    queueRef.current = stepped.queue;
    setQueue(stepped.queue);
    const follow = currentTrack(stepped.queue);
    if (follow === null) {
      return;
    }
    setIsPlaying(true);
    start(follow);
  }, [audio, queueRef, setIsPlaying, setQueue, start]);

  const play = useCallback(
    (track: PreviewTrack, context?: PreviewTrack[]) => {
      if (track.trackId === STAND_IN_TRACK_ID || track.locked) {
        return;
      }
      const active = currentTrack(queueRef.current);
      const sameTrack = active?.trackId === track.trackId;
      if (sameTrack && (isPlaying || loadedIdRef.current === track.trackId)) {
        if (isPlaying) {
          requestRef.current += 1;
          audio.pause();
          setIsPlaying(false);
        } else {
          if (listenIdRef.current === null) {
            const listen = stampListen(track.trackId);
            listenIdRef.current = listen.id;
            listenStartedRef.current = listen.startedAt;
            recordedRef.current = null;
          }
          audio.play();
          setIsPlaying(true);
        }
        return;
      }
      const nextQueue = replaceQueue(
        context ?? [track],
        track.trackId,
        queueRef.current
      );
      queueRef.current = nextQueue;
      setQueue(nextQueue);
      setQueueEpoch((epoch) => epoch + 1);
      const starting = currentTrack(nextQueue);
      if (starting === null || starting.locked) {
        setIsPlaying(false);
        return;
      }
      setIsPlaying(true);
      start(starting);
    },
    [
      audio,
      isPlaying,
      listenIdRef,
      listenStartedRef,
      loadedIdRef,
      queueRef,
      recordedRef,
      requestRef,
      setIsPlaying,
      setQueue,
      setQueueEpoch,
      start,
    ]
  );

  const playAlone = useCallback(
    (track: PreviewTrack) => {
      if (track.trackId === STAND_IN_TRACK_ID || track.locked) {
        return;
      }
      const active = currentTrack(queueRef.current);
      const already =
        active?.trackId === track.trackId &&
        loadedIdRef.current === track.trackId;
      const nextQueue = soloQueue(track, queueRef.current.repeat);
      queueRef.current = nextQueue;
      setQueue(nextQueue);
      setQueueEpoch((epoch) => epoch + 1);
      if (already) {
        if (!isPlaying) {
          audio.play();
          setIsPlaying(true);
        }
        return;
      }
      const starting = currentTrack(nextQueue);
      if (starting === null) {
        return;
      }
      setIsPlaying(true);
      start(starting);
    },
    [
      audio,
      isPlaying,
      loadedIdRef,
      queueRef,
      setIsPlaying,
      setQueue,
      setQueueEpoch,
      start,
    ]
  );

  const pause = useCallback(() => {
    requestRef.current += 1;
    audio.pause();
    setIsPlaying(false);
  }, [audio, requestRef, setIsPlaying]);

  const previous = useCallback(() => {
    const before = queueRef.current;
    const after = stepPrevious(before);
    if (after.index === before.index) {
      void audio.seekTo(0);
      return;
    }
    queueRef.current = after;
    setQueue(after);
    const item = currentTrack(after);
    if (item === null) {
      return;
    }
    setIsPlaying(true);
    start(item);
  }, [audio, queueRef, setIsPlaying, setQueue, start]);

  const seek = useCallback(
    (ratio: number) => {
      const seconds =
        statusRef.current.duration > 0
          ? statusRef.current.duration
          : (currentTrack(queueRef.current)?.durationMs ?? 0) / 1000;
      if (seconds <= 0) {
        return;
      }
      void audio.seekTo(Math.min(1, Math.max(0, ratio)) * seconds);
    },
    [audio, queueRef, statusRef]
  );

  const enqueue = useCallback(
    (
      track: PreviewTrack,
      update: (current: PlaybackQueue, track: PreviewTrack) => PlaybackQueue
    ) => {
      const current = queueRef.current;
      const nextQueue = update(current, track);
      queueRef.current = nextQueue;
      setQueue(nextQueue);
      if (current.tracks.length === 0 && !track.locked) {
        const starting = currentTrack(nextQueue);
        if (starting !== null) {
          setIsPlaying(true);
          start(starting);
        }
      }
    },
    [queueRef, setIsPlaying, setQueue, start]
  );

  return {
    play,
    playAlone,
    pause,
    start,
    toggle: () => {
      const active = currentTrack(queueRef.current);
      if (active !== null) {
        play(active);
      }
    },
    next,
    previous,
    seek,
    playUpcoming: (slot: number) => {
      const nextQueue = jumpToUpcoming(queueRef.current, slot);
      if (nextQueue === queueRef.current) {
        return;
      }
      queueRef.current = nextQueue;
      setQueue(nextQueue);
      const item = currentTrack(nextQueue);
      if (item === null) {
        return;
      }
      setIsPlaying(true);
      start(item);
    },
    playNext: (track: PreviewTrack) => {
      enqueue(track, insertNext);
    },
    addToQueue: (track: PreviewTrack) => {
      enqueue(track, appendTrack);
    },
  };
}
