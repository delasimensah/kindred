import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { PaywallFlow } from "@/components";
import { routeParam, routeSupportHref } from "@/utils";

const PaywallRoute = () => {
  const router = useRouter();
  const artistId = routeParam(
    useLocalSearchParams<{ artistId?: string }>().artistId
  );

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false, presentation: "transparentModal" }}
      />
      <PaywallFlow
        artistId={artistId}
        onClose={() => {
          router.back();
        }}
        onConfirmed={() => {
          router.replace(routeSupportHref(artistId));
        }}
      />
    </>
  );
};

export default PaywallRoute;
