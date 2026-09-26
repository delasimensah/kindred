import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import type { Href } from "expo-router";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

import { routeParam } from "@/utils";

import ArtistAlbumsScreen from "../ArtistAlbumsScreen/ArtistAlbumsScreen";

interface ArtistAlbumsRouteProps {
  albumHref: (releaseId: string) => Href;
}

const ArtistAlbumsRoute: React.FC<ArtistAlbumsRouteProps> = ({ albumHref }) => {
  const router = useRouter();
  const artistId = routeParam(
    useLocalSearchParams<{ artistId: string }>().artistId
  );
  const listed = useQuery(
    api.releases.listPublishedForArtist,
    artistId === undefined ? "skip" : { artistId: artistId as Id<"artists"> }
  );

  return (
    <>
      <Stack.Screen options={{ title: "Albums" }} />
      <ArtistAlbumsScreen
        albums={listed?.albums ?? []}
        isLoading={artistId !== undefined && listed === undefined}
        onOpenAlbum={(releaseId) => {
          router.push(albumHref(releaseId));
        }}
      />
    </>
  );
};

export default ArtistAlbumsRoute;
