import { ArtistProfileRoute } from "@/components";
import {
  libraryArtistAlbumHref,
  libraryArtistAlbumsHref,
  libraryArtistTracksHref,
} from "@/utils";

const LibraryArtistRoute = () => {
  return (
    <ArtistProfileRoute
      tracksHref={libraryArtistTracksHref}
      albumsHref={libraryArtistAlbumsHref}
      albumHref={libraryArtistAlbumHref}
    />
  );
};

export default LibraryArtistRoute;
