import { useRouter } from "expo-router";

import { LibraryScreen } from "@/components";
import { useFanSession } from "@/hooks";
import {
  ACCOUNT_HREF,
  libraryArtistsHref,
  libraryDownloadsHref,
  libraryLikedHref,
  libraryMixHref,
  libraryPlaylistsHref,
} from "@/utils";

const LibraryRoute = () => {
  const router = useRouter();
  const { displayName } = useFanSession();

  return (
    <LibraryScreen
      displayName={displayName}
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
