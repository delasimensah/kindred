import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

import { usePreviewPlayer } from "@/hooks";
import { bindQueueActions, catalogQueue, routeParam } from "@/utils";

import PopularTracksScreen from "../PopularTracksScreen/PopularTracksScreen";

const PopularTracksRoute: React.FC = () => {
  const player = usePreviewPlayer();
  const artistId = routeParam(
    useLocalSearchParams<{ artistId: string }>().artistId
  );
  const artist = useQuery(
    api.artists.get,
    artistId === undefined ? "skip" : { artistId: artistId as Id<"artists"> }
  );
  const setLiked = useMutation(api.library.setLiked);
  const listed = useQuery(
    api.tracks.listPublishedForArtist,
    artistId === undefined ? "skip" : { artistId: artistId as Id<"artists"> }
  );

  const queue =
    artist === undefined || artist === null
      ? []
      : catalogQueue("artist", artist.name, artistId, listed?.tracks ?? []);

  const actions = bindQueueActions(player, queue);

  return (
    <>
      <Stack.Screen options={{ title: "Popular tracks" }} />
      <PopularTracksScreen
        tracks={listed?.tracks ?? []}
        isLoading={artistId !== undefined && listed === undefined}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        onPlay={actions.play}
        onPlayNext={actions.playNext}
        onAddToQueue={actions.addToQueue}
        onToggleLike={(trackId) => {
          const track = listed?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined) {
            return;
          }
          void setLiked({ trackId: track.trackId, liked: !track.liked });
        }}
      />
    </>
  );
};

export default PopularTracksRoute;
