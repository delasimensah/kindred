import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";

import { LibraryArtistsScreen } from "@/components";
import { libraryArtistHref } from "@/utils";

const ArtistsRoute = () => {
  const router = useRouter();
  const artists = useQuery(api.follows.listMine, {});

  return (
    <>
      <Stack.Screen options={{ title: "Artists" }} />
      <LibraryArtistsScreen
        artists={artists ?? []}
        isLoading={artists === undefined}
        onOpen={(artistId) => {
          router.push(libraryArtistHref(artistId));
        }}
      />
    </>
  );
};

export default ArtistsRoute;
