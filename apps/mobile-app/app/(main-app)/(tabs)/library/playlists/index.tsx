import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";

import { PlaylistListScreen } from "@/components";
import { libraryNewPlaylistHref, libraryPlaylistHref } from "@/utils";

const PlaylistsRoute = () => {
  const router = useRouter();
  const playlists = useQuery(api.library.listPlaylists, {});
  const deletePlaylist = useMutation(api.library.deletePlaylist);

  return (
    <>
      <Stack.Screen options={{ title: "Playlists" }} />
      <PlaylistListScreen
        playlists={playlists ?? []}
        isLoading={playlists === undefined}
        onCreate={() => {
          router.push(libraryNewPlaylistHref());
        }}
        onOpen={(playlistId) => {
          const playlist = playlists?.find(
            (row) => row.playlistId === playlistId
          );
          router.push(libraryPlaylistHref(playlistId, playlist?.name));
        }}
        onDelete={(playlistId) => {
          void deletePlaylist({
            playlistId: playlistId as Id<"playlists">,
          });
        }}
      />
    </>
  );
};

export default PlaylistsRoute;
