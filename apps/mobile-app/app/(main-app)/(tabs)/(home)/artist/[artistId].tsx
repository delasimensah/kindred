import { ArtistProfileRoute } from "@/components";
import { homeArtistTracksHref } from "@/utils";

const HomeArtistRoute = () => {
  return <ArtistProfileRoute tracksHref={homeArtistTracksHref} />;
};

export default HomeArtistRoute;
