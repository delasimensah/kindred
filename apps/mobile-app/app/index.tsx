import { type Href, Redirect } from "expo-router";

import { useFanSession } from "@/hooks";

const IndexRoute = () => {
  const {
    isSessionLoading,
    isAuthenticated,
    isViewerReady,
    hasCompletedOnboarding,
  } = useFanSession();

  if (isSessionLoading || (isAuthenticated && !isViewerReady)) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href={"/(auth)" as Href} />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href={"/(onboarding)" as Href} />;
  }

  return <Redirect href={"/(main-app)" as Href} />;
};

export default IndexRoute;
