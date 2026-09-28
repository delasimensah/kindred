export interface PublicTrackItem {
  trackId: string;
  title: string;
  artistId: string;
  artistName: string;
  artistHandle: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  kindLabel: string;
}

export interface PublicReleaseItem {
  releaseId: string;
  title: string;
  type: "ep" | "album";
  artworkUrl: string | null;
  publishedAt: number | null;
  locked: boolean;
  tracks: PublicTrackItem[];
}

export interface PublicPostPreview {
  postId: string;
  createdAt: number;
  locked: boolean;
  preview: string | null;
}

export function playableTracks(tracks: PublicTrackItem[]): PublicTrackItem[] {
  return tracks.filter((track) => !track.locked);
}

export function displayPositions(
  tracks: { locked: boolean }[]
): Array<number | null> {
  let next = 1;
  return tracks.map((track) => {
    if (track.locked) {
      return null;
    }
    const current = next;
    next += 1;
    return current;
  });
}
