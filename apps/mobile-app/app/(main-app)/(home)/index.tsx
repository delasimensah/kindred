import { type Href, useRouter } from "expo-router";

import { HomeTabScreen } from "@/components";
import { useFanSession } from "@/hooks";

const HomeRoute = () => {
  const router = useRouter();
  const { displayName } = useFanSession();

  return (
    <HomeTabScreen
      displayName={displayName}
      onOpenAccount={() => {
        router.push("/(main-app)/(home)/account" as Href);
      }}
    />
  );
};

export default HomeRoute;
