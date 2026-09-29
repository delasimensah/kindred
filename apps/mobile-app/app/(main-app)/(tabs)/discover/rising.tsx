import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";

import { RisingArtistsScreen } from "@/components";
import { artistHref, changeFollow } from "@/utils";

const RisingArtistsRoute = () => {
  const router = useRouter();
  const page = useQuery(api.discovery.listForDiscover, {});
  const addFollow = useMutation(api.follows.add);
  const removeFollow = useMutation(api.follows.remove);

  const handleToggle = async (artistId: string) => {
    const row = page?.rising.find((artist) => artist.artistId === artistId);
    if (row === undefined) {
      return;
    }
    const id = artistId as Id<"artists">;
    await changeFollow(() =>
      row.isFollowed
        ? removeFollow({ artistId: id })
        : addFollow({ artistId: id })
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Rising artists" }} />
      <RisingArtistsScreen
        artists={page?.rising ?? []}
        isLoading={page === undefined}
        onToggleFollow={(artistId) => {
          void handleToggle(artistId);
        }}
        onOpenArtist={(artistId) => {
          router.push(artistHref(artistId));
        }}
      />
    </>
  );
};

export default RisingArtistsRoute;
