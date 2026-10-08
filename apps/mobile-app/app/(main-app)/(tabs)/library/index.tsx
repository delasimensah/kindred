import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";

import { LibraryScreen } from "@/components";
import { useFanSession } from "@/hooks";
import {
  ACCOUNT_HREF,
  libraryArtistHref,
  libraryArtistsHref,
  libraryDownloadsHref,
  libraryLikedHref,
  libraryMixHref,
  libraryPlaylistHref,
  libraryPlaylistsHref,
} from "@/utils";

const LibraryRoute = () => {
  const router = useRouter();
  const { avatarUrl, displayName } = useFanSession();
  const playlists = useQuery(api.library.listPlaylists, {});
  const artists = useQuery(api.follows.listMine, {});

  return (
    <LibraryScreen
      displayName={displayName}
      avatarUrl={avatarUrl}
      artists={artists}
      recentPlaylists={playlists}
      onOpenArtist={(artistId) => {
        router.push(libraryArtistHref(artistId));
      }}
      onOpenPlaylist={(playlistId, name) => {
        router.push(libraryPlaylistHref(playlistId, name));
      }}
      onOpenAccount={() => {
        router.push(ACCOUNT_HREF);
      }}
      onOpenPlaylists={() => {
        router.push(libraryPlaylistsHref());
      }}
      onOpenLiked={() => {
        router.push(libraryLikedHref());
      }}
      onOpenDownloads={() => {
        router.push(libraryDownloadsHref());
      }}
      onOpenArtists={() => {
        router.push(libraryArtistsHref());
      }}
      onOpenMix={() => {
        router.push(libraryMixHref());
      }}
    />
  );
};

export default LibraryRoute;
