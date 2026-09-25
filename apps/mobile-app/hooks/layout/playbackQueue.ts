export const STAND_IN_TRACK_ID = "stand-in";

export type ListenSource =
  "feed" | "artist" | "playlist" | "library" | "mix" | "search" | "offline";

export type RepeatMode = "off" | "one" | "all";

export interface PreviewTrack {
  trackId: string;
  title: string;
  artistName: string;
  artistId?: string;
  artworkUrl?: string | null;
  durationMs?: number;
  locked?: boolean;
  peaks?: number[];
  source?: ListenSource;
}

export interface QueueTrack {
  trackId: string;
  title: string;
  artistName: string;
  artistId: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  peaks: number[];
  source: ListenSource;
}

/** `order` is the play sequence of indexes into `tracks`. */
export interface PlaybackQueue {
  tracks: QueueTrack[];
  index: number;
  shuffle: boolean;
  repeat: RepeatMode;
  order: number[];
}

export type QueueStep =
  | { queue: PlaybackQueue; action: "play" }
  | { queue: PlaybackQueue; action: "replay" }
  | { queue: PlaybackQueue; action: "stop" };

export function emptyQueue(): PlaybackQueue {
  return { tracks: [], index: 0, shuffle: false, repeat: "off", order: [] };
}

export function normalizeTrack(
  track: PreviewTrack,
  source: ListenSource = track.source ?? "library"
): QueueTrack {
  return {
    trackId: track.trackId,
    title: track.title,
    artistName: track.artistName,
    artistId: track.artistId ?? "",
    artworkUrl: track.artworkUrl ?? null,
    durationMs: track.durationMs ?? 0,
    locked: track.locked ?? false,
    peaks: track.peaks ?? [],
    source,
  };
}

export function currentTrack(queue: PlaybackQueue): QueueTrack | null {
  return queue.tracks[queue.index] ?? null;
}

export function upcomingIndexes(queue: PlaybackQueue): number[] {
  const start = queue.order.indexOf(queue.index);
  if (start === -1) {
    return [];
  }
  return queue.order.slice(start + 1);
}

export function replaceQueue(
  tracks: PreviewTrack[],
  startId: string,
  previous: Pick<PlaybackQueue, "shuffle" | "repeat">,
  rng: () => number = Math.random
): PlaybackQueue {
  const normalized = tracks.map((track) =>
    normalizeTrack(track, track.source ?? "library")
  );
  const found = normalized.findIndex((track) => track.trackId === startId);
  let index = found === -1 ? 0 : found;
  if (normalized[index]?.locked) {
    const playable = normalized.findIndex(
      (track, position) => position > index && !track.locked
    );
    if (playable !== -1) {
      index = playable;
    }
  }
  const queue: PlaybackQueue = {
    tracks: normalized,
    index,
    shuffle: false,
    repeat: previous.repeat,
    order: normalized.map((_, position) => position),
  };
  return previous.shuffle ? setShuffle(queue, true, rng) : queue;
}

/** This track only. The previous list, including its shuffle order, is dropped. */
export function soloQueue(
  track: PreviewTrack,
  repeat: RepeatMode
): PlaybackQueue {
  return replaceQueue([track], track.trackId, { shuffle: false, repeat });
}

export function insertNext(
  queue: PlaybackQueue,
  track: PreviewTrack
): PlaybackQueue {
  const normalized = normalizeTrack(track);
  if (queue.tracks.length === 0) {
    return replaceQueue([track], track.trackId, queue);
  }
  const at = queue.index + 1;
  const tracks = [
    ...queue.tracks.slice(0, at),
    normalized,
    ...queue.tracks.slice(at),
  ];
  const order = queue.order.map((position) =>
    position >= at ? position + 1 : position
  );
  const currentPos = order.indexOf(queue.index);
  order.splice(currentPos + 1, 0, at);
  return { ...queue, tracks, order };
}

export function appendTrack(
  queue: PlaybackQueue,
  track: PreviewTrack
): PlaybackQueue {
  if (queue.tracks.length === 0) {
    return replaceQueue([track], track.trackId, queue);
  }
  const normalized = normalizeTrack(track);
  return {
    ...queue,
    tracks: [...queue.tracks, normalized],
    order: [...queue.order, queue.tracks.length],
  };
}

export function removeAt(queue: PlaybackQueue, index: number): PlaybackQueue {
  if (index === queue.index || index < 0 || index >= queue.tracks.length) {
    return queue;
  }
  const tracks = queue.tracks.filter((_, position) => position !== index);
  const order = queue.order
    .filter((position) => position !== index)
    .map((position) => (position > index ? position - 1 : position));
  return {
    ...queue,
    tracks,
    order,
    index: queue.index > index ? queue.index - 1 : queue.index,
  };
}

/** Makes an upcoming slot the track that is playing. Locked rows stay where they are. */
export function jumpToUpcoming(
  queue: PlaybackQueue,
  slot: number
): PlaybackQueue {
  const index = upcomingIndexes(queue)[slot];
  const item = index === undefined ? undefined : queue.tracks[index];
  if (index === undefined || item === undefined || item.locked) {
    return queue;
  }
  return { ...queue, index };
}

export function removeUpcoming(
  queue: PlaybackQueue,
  slot: number
): PlaybackQueue {
  const index = upcomingIndexes(queue)[slot];
  if (index === undefined) {
    return queue;
  }
  return removeAt(queue, index);
}

export function moveUpcoming(
  queue: PlaybackQueue,
  fromSlot: number,
  toSlot: number
): PlaybackQueue {
  const upcoming = upcomingIndexes(queue);
  if (
    fromSlot === toSlot ||
    fromSlot < 0 ||
    toSlot < 0 ||
    fromSlot >= upcoming.length ||
    toSlot >= upcoming.length
  ) {
    return queue;
  }
  const next = [...upcoming];
  const [moved] = next.splice(fromSlot, 1);
  if (moved === undefined) {
    return queue;
  }
  next.splice(toSlot, 0, moved);
  const start = queue.order.indexOf(queue.index);
  return {
    ...queue,
    order: [...queue.order.slice(0, start + 1), ...next],
  };
}

export function stepNext(queue: PlaybackQueue): QueueStep {
  const playing = queue.tracks[queue.index];
  if (queue.repeat === "one") {
    if (playing === undefined || playing.locked) {
      return { queue, action: "stop" };
    }
    return { queue, action: "replay" };
  }
  const start = queue.order.indexOf(queue.index);
  const limit =
    queue.repeat === "all"
      ? queue.order.length
      : queue.order.length - start - 1;
  for (let step = 1; step <= limit; step += 1) {
    const next = queue.order[(start + step) % queue.order.length];
    const item = next === undefined ? undefined : queue.tracks[next];
    if (item === undefined || item.locked) {
      continue;
    }
    if (next === queue.index) {
      return { queue, action: "replay" };
    }
    return { queue: { ...queue, index: next }, action: "play" };
  }
  return { queue, action: "stop" };
}

export function stepPrevious(queue: PlaybackQueue): PlaybackQueue {
  const start = queue.order.indexOf(queue.index);
  for (let step = 1; step <= start; step += 1) {
    const previous = queue.order[start - step];
    const item = previous === undefined ? undefined : queue.tracks[previous];
    if (item !== undefined && !item.locked) {
      return { ...queue, index: previous };
    }
  }
  return queue;
}

export function cycleRepeat(queue: PlaybackQueue): PlaybackQueue {
  const repeat: RepeatMode =
    queue.repeat === "off" ? "all" : queue.repeat === "all" ? "one" : "off";
  return { ...queue, repeat };
}

export function setShuffle(
  queue: PlaybackQueue,
  enabled: boolean,
  rng: () => number = Math.random
): PlaybackQueue {
  if (!enabled) {
    return {
      ...queue,
      shuffle: false,
      order: queue.tracks.map((_, position) => position),
    };
  }
  const rest = queue.tracks
    .map((_, position) => position)
    .filter((position) => position !== queue.index);
  for (let index = rest.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    const current = rest[index];
    const other = rest[swap];
    if (current === undefined || other === undefined) {
      continue;
    }
    rest[index] = other;
    rest[swap] = current;
  }
  return { ...queue, shuffle: true, order: [queue.index, ...rest] };
}

export function applyPlayable(
  queue: PlaybackQueue,
  rows: { trackId: string; playable: boolean }[]
): PlaybackQueue {
  const playable = new Map(rows.map((row) => [row.trackId, row.playable]));
  return {
    ...queue,
    tracks: queue.tracks.map((track) => {
      const allowed = playable.get(track.trackId);
      if (allowed === undefined) {
        return track;
      }
      return { ...track, locked: !allowed };
    }),
  };
}
