import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Stack, useRouter } from "expo-router";

import { CreatePlaylistScreen } from "@/components";
import {
  getConvexErrorMessage,
  libraryPlaylistHref,
  showErrorToast,
} from "@/utils";

const NewPlaylistRoute = () => {
  const router = useRouter();
  const createPlaylist = useMutation(api.library.createPlaylist);

  return (
    <>
      <Stack.Screen options={{ title: "New playlist" }} />
      <CreatePlaylistScreen
        onCreate={(name) => {
          void createPlaylist({ name })
            .then((playlistId) => {
              router.replace(libraryPlaylistHref(playlistId, name));
            })
            .catch((error: unknown) => {
              showErrorToast(getConvexErrorMessage(error));
            });
        }}
      />
    </>
  );
};

export default NewPlaylistRoute;
