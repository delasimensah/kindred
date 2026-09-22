import { type Href, Redirect } from "expo-router";

import { useFanSession } from "@/hooks";

const OnboardingIndexRoute = () => {
  const { onboardingStep } = useFanSession();

  if (onboardingStep === "follows") {
    return <Redirect href={"/(onboarding)/follow-artists" as Href} />;
  }

  return <Redirect href={"/(onboarding)/genres" as Href} />;
};

export default OnboardingIndexRoute;
