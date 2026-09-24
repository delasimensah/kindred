import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";

import { AddPlaylistTracksScreen } from "@/components";
import {
  getConvexErrorMessage,
  routeParam,
  showPlaylistAddedToast,
} from "@/utils";

const AddTracksRoute = () => {
  const playlistId = routeParam(
    useLocalSearchParams<{ playlistId: string }>().playlistId
  );
  const tracks = useQuery(
    api.library.listAddableTracks,
    playlistId === undefined
      ? "skip"
      : { playlistId: playlistId as Id<"playlists"> }
  );
  const playlist = useQuery(
    api.library.getPlaylist,
    playlistId === undefined
      ? "skip"
      : { playlistId: playlistId as Id<"playlists"> }
  );
  const addTrack = useMutation(api.library.addTrack);

  return (
    <>
      <Stack.Screen options={{ title: "Add tracks" }} />
      <AddPlaylistTracksScreen
        tracks={tracks ?? []}
        isLoading={playlistId !== undefined && tracks === undefined}
        onAdd={(trackId) => {
          if (playlistId === undefined) {
            return;
          }
          void addTrack({
            playlistId: playlistId as Id<"playlists">,
            trackId: trackId as Id<"tracks">,
          })
            .then(() => {
              showPlaylistAddedToast(playlist?.name ?? "playlist");
            })
            .catch((error: unknown) => {
              Alert.alert("Could not add track", getConvexErrorMessage(error));
            });
        }}
      />
    </>
  );
};

export default AddTracksRoute;
