import { ArtistAlbumsRoute } from "@/components";
import { artistAlbumHref } from "@/utils";

export default function DiscoverArtistAlbumsRoute() {
  return <ArtistAlbumsRoute albumHref={artistAlbumHref} />;
}
