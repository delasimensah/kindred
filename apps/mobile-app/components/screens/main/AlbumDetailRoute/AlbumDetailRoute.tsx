import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

import { usePreviewPlayer } from "@/hooks";
import {
  bindQueueActions,
  catalogQueue,
  coverHeaderScreenOptions,
  lockedTrackHref,
  routeParam,
} from "@/utils";

import AlbumDetailScreen from "../AlbumDetailScreen/AlbumDetailScreen";

const AlbumDetailRoute: React.FC = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const releaseId = routeParam(
    useLocalSearchParams<{ releaseId: string }>().releaseId
  );
  const album = useQuery(
    api.releases.get,
    releaseId === undefined
      ? "skip"
      : { releaseId: releaseId as Id<"releases"> }
  );
  const setLiked = useMutation(api.library.setLiked);

  const queue =
    album === undefined || album === null
      ? []
      : catalogQueue("artist", album.artistName, album.artistId, album.tracks);

  const actions = bindQueueActions(player, queue);
  const firstPlayable = album?.tracks.find((track) => !track.locked);

  return (
    <>
      <Stack.Screen options={coverHeaderScreenOptions} />
      <AlbumDetailScreen
        title={album === null ? null : (album?.title ?? null)}
        typeLabel={
          album === undefined || album === null
            ? null
            : album.type === "ep"
              ? "EP"
              : "Album"
        }
        artistName={album?.artistName ?? null}
        artworkUrl={album?.artworkUrl ?? null}
        tracks={album?.tracks ?? []}
        isLoading={releaseId !== undefined && album === undefined}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        onPlay={actions.play}
        onPlayNext={actions.playNext}
        onAddToQueue={actions.addToQueue}
        onToggleLike={(trackId) => {
          const track = album?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined) {
            return;
          }
          void setLiked({
            trackId: track.trackId as Id<"tracks">,
            liked: !track.liked,
          });
        }}
        onPlayAll={
          firstPlayable === undefined
            ? undefined
            : () => actions.play(firstPlayable.trackId)
        }
        onOpenLocked={(trackId) => {
          const track = album?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined || album === undefined || album === null) {
            return;
          }
          router.push(
            lockedTrackHref({
              title: track.title,
              artistName: album.artistName,
              artworkUrl: track.artworkUrl,
            })
          );
        }}
      />
    </>
  );
};

export default AlbumDetailRoute;
