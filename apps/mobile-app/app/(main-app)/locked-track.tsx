import { useLocalSearchParams, useRouter } from "expo-router";

import { LockedTrackScreen } from "@/components";
import { PAYWALL_HREF, routeParam } from "@/utils";

const LockedTrackRoute = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    artistName?: string;
    artworkUrl?: string;
  }>();
  const title = routeParam(params.title) ?? "Supporters only";
  const artistName = routeParam(params.artistName) ?? "This artist";
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
        router.push(PAYWALL_HREF);
      }}
    />
  );
};

export default LockedTrackRoute;
