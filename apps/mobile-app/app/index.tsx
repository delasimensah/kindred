import { type Href, Redirect } from "expo-router";

import { useFanSession } from "@/hooks";

const IndexRoute = () => {
  const { isAuthenticated, isViewerReady } = useFanSession();

  if (!isAuthenticated) {
    return <Redirect href={"/(auth)" as Href} />;
  }

  if (!isViewerReady) {
    return null;
  }

  return <Redirect href={"/(main-app)" as Href} />;
};

export default IndexRoute;
