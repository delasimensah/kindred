import { useRouter } from "expo-router";

import { HomeTabScreen } from "@/components";
import { useFanSession } from "@/hooks";
import { ACCOUNT_HREF } from "@/utils";

const HomeRoute = () => {
  const router = useRouter();
  const { displayName } = useFanSession();

  return (
    <HomeTabScreen
      displayName={displayName}
      onOpenAccount={() => {
        router.push(ACCOUNT_HREF);
      }}
    />
  );
};

export default HomeRoute;
