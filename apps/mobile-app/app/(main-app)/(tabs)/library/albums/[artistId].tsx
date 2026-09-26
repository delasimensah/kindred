import { ArtistAlbumsRoute } from "@/components";
import { libraryArtistAlbumHref } from "@/utils";

export default function LibraryArtistAlbumsRoute() {
  return <ArtistAlbumsRoute albumHref={libraryArtistAlbumHref} />;
}
