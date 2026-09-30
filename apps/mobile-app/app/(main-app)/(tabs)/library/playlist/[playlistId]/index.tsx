import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { LibraryMessageScreen, LibraryTracksScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import {
  bindQueueActions,
  catalogQueue,
  coverHeaderScreenOptions,
  libraryAddTracksHref,
  lockedTrackHref,
  routeParam,
} from "@/utils";

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
  const actions = bindQueueActions(
    player,
    catalogQueue("playlist", "", undefined, playlist?.tracks ?? [])
  );

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
      <Stack.Screen options={coverHeaderScreenOptions} />
      <LibraryTracksScreen
        collection={{
          title: playlist?.name ?? openedName ?? "Playlist",
          detail: playlistDetail(playlist?.tracks.length ?? 0),
          artworkUrls: (playlist?.tracks ?? []).flatMap((track) =>
            track.artworkUrl ? [track.artworkUrl] : []
          ),
        }}
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
        onPlay={actions.play}
        onPlayNext={actions.playNext}
        onAddToQueue={actions.addToQueue}
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
        onOpenLocked={(trackId) => {
          const track = playlist?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined) {
            return;
          }
          router.push(
            lockedTrackHref({
              title: track.title,
              artistName: track.artistName,
              artworkUrl: track.artworkUrl,
            })
          );
        }}
      />
    </>
  );
};

function playlistDetail(count: number) {
  return count === 1 ? "1 track" : `${count} tracks`;
}

export default PlaylistRoute;
