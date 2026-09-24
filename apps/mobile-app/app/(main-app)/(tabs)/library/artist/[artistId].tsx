import { ArtistProfileRoute } from "@/components";
import { libraryArtistTracksHref } from "@/utils";

const LibraryArtistRoute = () => {
  return <ArtistProfileRoute tracksHref={libraryArtistTracksHref} />;
};

export default LibraryArtistRoute;
