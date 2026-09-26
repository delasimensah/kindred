import { ArtistProfileRoute } from "@/components";
import {
  homeArtistAlbumHref,
  homeArtistAlbumsHref,
  homeArtistTracksHref,
} from "@/utils";

const HomeArtistRoute = () => {
  return (
    <ArtistProfileRoute
      tracksHref={homeArtistTracksHref}
      albumsHref={homeArtistAlbumsHref}
      albumHref={homeArtistAlbumHref}
    />
  );
};

export default HomeArtistRoute;
