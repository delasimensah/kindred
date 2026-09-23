import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { LibraryMessageScreen, LibraryTracksScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import { libraryAddTracksHref, libraryTrackHref, routeParam } from "@/utils";

const PlaylistRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const params = useLocalSearchParams<{
    playlistId: string;
    name?: string;
  }>();
  const playlistId = routeParam(params.playlistId);
  const openedName = routeParam(params.name);
  const playlist = useQuery(
    api.library.getPlaylist,
    playlistId === undefined
      ? "skip"
      : { playlistId: playlistId as Id<"playlists"> }
  );
  const setLiked = useMutation(api.library.setLiked);
  const removeTrack = useMutation(api.library.removeTrack);

  if (playlist === null) {
    return (
      <>
        <Stack.Screen options={{ title: openedName ?? "" }} />
        <LibraryMessageScreen
          icon="albums"
          title="Playlist not found"
          subtitle="This playlist is private, or it is no longer here."
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: playlist?.name ?? openedName ?? "" }} />
      <LibraryTracksScreen
        tracks={playlist?.tracks ?? []}
        isLoading={playlistId !== undefined && playlist === undefined}
        empty={{
          icon: "musical-notes",
          title: "No tracks yet",
          subtitle: "Add a published track and it shows up here.",
        }}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        headerAction={
          playlistId === undefined
            ? undefined
            : {
                label: "Add tracks",
                onPress: () => {
                  router.push(libraryAddTracksHref(playlistId));
                },
              }
        }
        onPlay={(trackId) => {
          const track = playlist?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined || track.locked) {
            return;
          }
          player.play({
            trackId: track.trackId,
            title: track.title,
            artistName: track.artistName,
          });
        }}
        onOpenLocked={(trackId) => {
          router.push(libraryTrackHref(trackId));
        }}
        onToggleLike={(trackId) => {
          const track = playlist?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined) {
            return;
          }
          void setLiked({ trackId: track.trackId, liked: !track.liked });
        }}
        onRemove={(trackId) => {
          if (playlistId === undefined) {
            return;
          }
          void removeTrack({
            playlistId: playlistId as Id<"playlists">,
            trackId: trackId as Id<"tracks">,
          });
        }}
      />
    </>
  );
};

export default PlaylistRoute;
