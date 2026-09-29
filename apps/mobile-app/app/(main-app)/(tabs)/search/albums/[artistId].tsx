import { ArtistAlbumsRoute } from "@/components";
import { searchArtistAlbumHref } from "@/utils";

export default function SearchArtistAlbumsRoute() {
  return <ArtistAlbumsRoute albumHref={searchArtistAlbumHref} />;
}
