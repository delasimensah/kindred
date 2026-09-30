import { useLocalSearchParams, useRouter } from "expo-router";

import { LockedTrackScreen } from "@/components";
import { useOpenSupport } from "@/hooks";
import { routeParam } from "@/utils";

const LockedTrackRoute = () => {
  const router = useRouter();
  const openSupport = useOpenSupport();
  const params = useLocalSearchParams<{
    title?: string;
    artistName?: string;
    artistId?: string;
    artworkUrl?: string;
  }>();
  const title = routeParam(params.title) ?? "Supporters only";
  const artistName = routeParam(params.artistName) ?? "This artist";
  const artistId = routeParam(params.artistId);
  const artworkUrl = routeParam(params.artworkUrl) ?? null;

  return (
    <LockedTrackScreen
      title={title}
      artistName={artistName}
      artworkUrl={artworkUrl}
      onClose={() => {
        router.back();
      }}
      onOpenPaywall={() => {
        openSupport(artistId, true);
      }}
    />
  );
};

export default LockedTrackRoute;
