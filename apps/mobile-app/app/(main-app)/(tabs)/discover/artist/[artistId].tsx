import { ArtistProfileRoute } from "@/components";
import { artistAlbumHref, artistAlbumsHref, artistTracksHref } from "@/utils";

const DiscoverArtistRoute = () => {
  return (
    <ArtistProfileRoute
      tracksHref={artistTracksHref}
      albumsHref={artistAlbumsHref}
      albumHref={artistAlbumHref}
    />
  );
};

export default DiscoverArtistRoute;
