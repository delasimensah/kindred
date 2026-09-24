import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AudioPlayer, AudioStatus } from "expo-audio";
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  currentTrack,
  type ListenSource,
  type PlaybackQueue,
  type QueueTrack,
  type RepeatMode,
  STAND_IN_TRACK_ID,
} from "./playbackQueue";

const STORAGE_KEY = "kindred.player.session";

const SOURCES = new Set<ListenSource>([
  "feed",
  "artist",
  "playlist",
  "library",
  "mix",
  "search",
  "offline",
]);

const REPEATS = new Set<RepeatMode>(["off", "one", "all"]);

export interface SeekArm {
  trackId: string;
  seconds: number;
  sawUnload: boolean;
}

interface SavedTrack {
  trackId: string;
  title: string;
  artistName: string;
  artistId: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  source: ListenSource;
}

interface SavedSession {
  tracks: SavedTrack[];
  index: number;
  order: number[];
  shuffle: boolean;
  repeat: RepeatMode;
  positionSec: number;
}

export function serializePlaybackSession(
  queue: PlaybackQueue,
  positionSec: number
): string | null {
  const playing = currentTrack(queue);
  if (playing === null || playing.trackId === STAND_IN_TRACK_ID) {
    return null;
  }
  const session: SavedSession = {
    tracks: queue.tracks.map((track) => ({
      trackId: track.trackId,
      title: track.title,
      artistName: track.artistName,
      artistId: track.artistId,
      artworkUrl: track.artworkUrl,
      durationMs: track.durationMs,
      locked: track.locked,
      source: track.source,
    })),
    index: queue.index,
    order: queue.order,
    shuffle: queue.shuffle,
    repeat: queue.repeat,
    positionSec: Math.max(0, positionSec),
  };
  return JSON.stringify(session);
}

export function parsePlaybackSession(raw: string): {
  queue: PlaybackQueue;
  positionSec: number;
} | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isSession(parsed)) {
    return null;
  }
  return {
    queue: {
      tracks: parsed.tracks.map(toQueueTrack),
      index: parsed.index,
      order: parsed.order,
      shuffle: parsed.shuffle,
      repeat: parsed.repeat,
    },
    positionSec: parsed.positionSec,
  };
}

export async function loadPlaybackSession(): Promise<{
  queue: PlaybackQueue;
  positionSec: number;
} | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return null;
  }
  return parsePlaybackSession(raw);
}

export async function savePlaybackSession(
  queue: PlaybackQueue,
  positionSec: number
): Promise<void> {
  const raw = serializePlaybackSession(queue, positionSec);
  if (raw === null) {
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, raw);
}

interface PersistenceInput {
  audio: AudioPlayer;
  queue: PlaybackQueue;
  queueRef: RefObject<PlaybackQueue>;
  setQueue: Dispatch<SetStateAction<PlaybackQueue>>;
  status: AudioStatus;
  isPlaying: boolean;
  loadedIdRef: RefObject<string | null>;
  resumeAtRef: RefObject<number | null>;
  seekArmRef: RefObject<SeekArm | null>;
  listenFloorRef: RefObject<number>;
  start: (track: QueueTrack) => void;
}

/** Restores the last track, then keeps the saved position once audio has loaded. */
export function usePlaybackPersistence({
  audio,
  queue,
  queueRef,
  setQueue,
  status,
  isPlaying,
  loadedIdRef,
  resumeAtRef,
  seekArmRef,
  listenFloorRef,
  start,
}: PersistenceInput): boolean {
  const [ready, setReady] = useState(false);
  const startRef = useRef(start);
  const booted = useRef(false);

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  useEffect(() => {
    if (booted.current) {
      return;
    }
    booted.current = true;
    void loadPlaybackSession()
      .then((session) => {
        if (session !== null && queueRef.current.tracks.length === 0) {
          queueRef.current = session.queue;
          setQueue(session.queue);
          resumeAtRef.current = session.positionSec;
          listenFloorRef.current = session.positionSec;
          const track = currentTrack(session.queue);
          if (track !== null && !track.locked) {
            startRef.current(track);
          }
        }
        setReady(true);
      })
      .catch(() => {
        setReady(true);
      });
  }, [listenFloorRef, queueRef, resumeAtRef, setQueue]);

  useEffect(() => {
    const arm = seekArmRef.current;
    if (arm === null) {
      return;
    }
    if (!status.isLoaded) {
      if (!arm.sawUnload) {
        seekArmRef.current = { ...arm, sawUnload: true };
      }
      return;
    }
    if (!arm.sawUnload || loadedIdRef.current !== arm.trackId) {
      return;
    }
    if (!(status.duration > 0)) {
      return;
    }
    seekArmRef.current = null;
    const seconds = Math.min(arm.seconds, Math.max(0, status.duration - 0.05));
    void audio.seekTo(seconds).then(() => {
      audio.pause();
    });
  }, [audio, loadedIdRef, seekArmRef, status.duration, status.isLoaded]);

  useEffect(() => {
    if (!ready || queue.tracks.length === 0) {
      return;
    }
    const timer = setTimeout(() => {
      void savePlaybackSession(queue, (status.currentTime ?? 0) || 0).catch(
        () => undefined
      );
    }, 400);
    return () => {
      clearTimeout(timer);
    };
  }, [isPlaying, queue, ready, status.currentTime]);

  return ready;
}

function toQueueTrack(track: SavedTrack): QueueTrack {
  return {
    ...track,
    peaks: [],
  };
}

function isSession(value: unknown): value is SavedSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const session = value as SavedSession;
  if (
    !Array.isArray(session.tracks) ||
    session.tracks.length === 0 ||
    session.tracks.length > 100 ||
    !session.tracks.every(isSavedTrack)
  ) {
    return false;
  }
  if (
    !Number.isInteger(session.index) ||
    session.index < 0 ||
    session.index >= session.tracks.length
  ) {
    return false;
  }
  if (
    !Array.isArray(session.order) ||
    session.order.length !== session.tracks.length ||
    !sameMembers(
      session.order,
      session.tracks.map((_, index) => index)
    )
  ) {
    return false;
  }
  return (
    typeof session.shuffle === "boolean" &&
    REPEATS.has(session.repeat) &&
    typeof session.positionSec === "number" &&
    Number.isFinite(session.positionSec) &&
    session.positionSec >= 0
  );
}

function isSavedTrack(value: unknown): value is SavedTrack {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const track = value as SavedTrack;
  return (
    typeof track.trackId === "string" &&
    track.trackId.length > 0 &&
    track.trackId !== STAND_IN_TRACK_ID &&
    typeof track.title === "string" &&
    typeof track.artistName === "string" &&
    typeof track.artistId === "string" &&
    (track.artworkUrl === null || typeof track.artworkUrl === "string") &&
    typeof track.durationMs === "number" &&
    typeof track.locked === "boolean" &&
    SOURCES.has(track.source)
  );
}

function sameMembers(order: number[], indexes: number[]): boolean {
  if (order.some((value) => !Number.isInteger(value))) {
    return false;
  }
  const left = [...order].sort((a, b) => a - b);
  const right = [...indexes].sort((a, b) => a - b);
  return left.every((value, index) => value === right[index]);
}
