import { ArtistProfileRoute } from "@/components";
import { artistTracksHref } from "@/utils";

const DiscoverArtistRoute = () => {
  return <ArtistProfileRoute tracksHref={artistTracksHref} />;
};

export default DiscoverArtistRoute;
