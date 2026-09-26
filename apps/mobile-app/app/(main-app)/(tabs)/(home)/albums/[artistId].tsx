import { ArtistAlbumsRoute } from "@/components";
import { homeArtistAlbumHref } from "@/utils";

export default function HomeArtistAlbumsRoute() {
  return <ArtistAlbumsRoute albumHref={homeArtistAlbumHref} />;
}
