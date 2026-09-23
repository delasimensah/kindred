import { useRouter } from "expo-router";

import { TabRootScreen } from "@/components";
import { useFanSession } from "@/hooks";
import { ACCOUNT_HREF } from "@/utils";

const LibraryRoute = () => {
  const router = useRouter();
  const { displayName } = useFanSession();

  return (
    <TabRootScreen
      title="Library"
      body="Playlists and liked songs show up here."
      displayName={displayName}
      onOpenAccount={() => {
        router.push(ACCOUNT_HREF);
      }}
    />
  );
};

export default LibraryRoute;
