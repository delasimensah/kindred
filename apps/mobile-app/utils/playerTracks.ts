import type { ListenSource, PreviewTrack } from "@/hooks";

interface CatalogRow {
  trackId: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  artistName?: string;
  peaks?: number[];
}

interface QueuePlayer {
  play: (track: PreviewTrack, queue?: PreviewTrack[]) => void;
  playNext: (track: PreviewTrack) => void;
  addToQueue: (track: PreviewTrack) => void;
}

export function bindQueueActions(player: QueuePlayer, queue: PreviewTrack[]) {
  const find = (trackId: string) =>
    queue.find((row) => row.trackId === trackId);

  return {
    play(trackId: string) {
      const track = find(trackId);
      if (track === undefined || track.locked) {
        return;
      }
      player.play(track, queue);
    },
    playNext(trackId: string) {
      const track = find(trackId);
      if (track === undefined) {
        return;
      }
      player.playNext(track);
    },
    addToQueue(trackId: string) {
      const track = find(trackId);
      if (track === undefined) {
        return;
      }
      player.addToQueue(track);
    },
  };
}

export function catalogQueue(
  source: ListenSource,
  artistName: string,
  artistId: string | undefined,
  tracks: CatalogRow[]
): PreviewTrack[] {
  return tracks.map((track) => ({
    trackId: track.trackId,
    title: track.title,
    artistName: track.artistName ?? artistName,
    artistId,
    artworkUrl: track.artworkUrl,
    durationMs: track.durationMs,
    locked: track.locked,
    source,
    ...(track.peaks === undefined ? {} : { peaks: track.peaks }),
  }));
}
