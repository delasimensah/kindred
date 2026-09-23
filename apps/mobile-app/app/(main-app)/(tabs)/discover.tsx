import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";

import { DiscoverScreen } from "@/components";
import { useFanSession } from "@/hooks";
import { ACCOUNT_HREF } from "@/utils";

const DiscoverRoute = () => {
  const router = useRouter();
  const { displayName } = useFanSession();
  const page = useQuery(api.discovery.listForDiscover, {});
  const addFollow = useMutation(api.follows.add);
  const removeFollow = useMutation(api.follows.remove);

  const handleToggle = async (artistId: string) => {
    const featured = page?.featured.find((row) => row.artistId === artistId);
    const rising = page?.rising.find((row) => row.artistId === artistId);
    const row = featured ?? rising;
    if (row === undefined) {
      return;
    }
    if (row.isFollowed) {
      await removeFollow({ artistId: artistId as Id<"artists"> });
      return;
    }
    await addFollow({ artistId: artistId as Id<"artists"> });
  };

  return (
    <DiscoverScreen
      displayName={displayName}
      featured={page?.featured ?? []}
      rising={page?.rising ?? []}
      isLoading={page === undefined}
      onToggleFollow={(artistId) => {
        void handleToggle(artistId);
      }}
      onOpenAccount={() => {
        router.push(ACCOUNT_HREF);
      }}
    />
  );
};

export default DiscoverRoute;
