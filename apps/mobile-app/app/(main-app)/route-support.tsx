import { Stack } from "expo-router";

import { RouteSupportFlow } from "@/components";

const RouteSupportRoute = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RouteSupportFlow />
    </>
  );
};

export default RouteSupportRoute;
