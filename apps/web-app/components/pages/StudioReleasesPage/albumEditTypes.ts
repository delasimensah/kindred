import type { Id } from "@convex/_generated/dataModel";

import type { AlbumEditTrackRow } from "./AlbumEditTracksSection";

export type EditingAlbum = {
  releaseId: Id<"releases">;
  title: string;
  type: "ep" | "album";
  description: string | null;
  tags: string[];
  genre: string;
  visibility: "public" | "supporters";
  state: "draft" | "scheduled" | "published";
  artworkUrl: string | null;
  tracks: AlbumEditTrackRow[];
};

export type AlbumEditSaveValues = {
  title: string;
  description: string;
  tags: string[];
  genre: string;
  visibility: "public" | "supporters";
  artworkFileId?: Id<"files">;
  tracks: { trackId: Id<"tracks">; title: string }[];
};
