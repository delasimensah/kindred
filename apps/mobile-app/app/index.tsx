import { useConvexAuth } from "convex/react";
import { type Href, Redirect } from "expo-router";

import { RoleWaitScreen } from "@/components";

const IndexRoute = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <RoleWaitScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href={"/(auth)/sign-in" as Href} />;
  }

  return <Redirect href={"/(app)" as Href} />;
};

export default IndexRoute;
