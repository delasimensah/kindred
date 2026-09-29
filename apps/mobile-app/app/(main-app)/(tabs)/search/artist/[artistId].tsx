import { ArtistProfileRoute } from "@/components";
import {
  searchArtistAlbumHref,
  searchArtistAlbumsHref,
  searchArtistTracksHref,
} from "@/utils";

const SearchArtistRoute = () => {
  return (
    <ArtistProfileRoute
      tracksHref={searchArtistTracksHref}
      albumsHref={searchArtistAlbumsHref}
      albumHref={searchArtistAlbumHref}
    />
  );
};

export default SearchArtistRoute;
