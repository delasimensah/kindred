import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { ArtistProfileScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import {
  bindQueueActions,
  catalogQueue,
  coverHeaderScreenOptions,
  libraryArtistTracksHref,
  POPULAR_TRACK_PREVIEW,
  routeParam,
} from "@/utils";

const ArtistRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const artistId = routeParam(
    useLocalSearchParams<{ artistId: string }>().artistId
  );
  const artistArgs =
    artistId === undefined ? "skip" : { artistId: artistId as Id<"artists"> };
  const artist = useQuery(api.artists.get, artistArgs);
  const listed = useQuery(
    api.tracks.listPublishedForArtist,
    artistId === undefined
      ? "skip"
      : {
          artistId: artistId as Id<"artists">,
          limit: POPULAR_TRACK_PREVIEW,
        }
  );
  const updates = useQuery(api.posts.listForArtist, artistArgs);
  const addFollow = useMutation(api.follows.add);
  const removeFollow = useMutation(api.follows.remove);
  const setLiked = useMutation(api.library.setLiked);
  const [now] = useState(() => Date.now());

  const isLoading =
    artistId !== undefined &&
    (artist === undefined || listed === undefined || updates === undefined);

  const queue =
    artist === undefined || artist === null
      ? []
      : catalogQueue("artist", artist.name, artistId, listed?.tracks ?? []);

  const actions = bindQueueActions(player, queue);

  return (
    <>
      <Stack.Screen options={coverHeaderScreenOptions} />
      <ArtistProfileScreen
        artist={artist ?? null}
        tracks={listed?.tracks ?? []}
        updates={updates ?? []}
        isLoading={isLoading}
        now={now}
        hasMoreTracks={listed?.hasMore ?? false}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        onToggleFollow={() => {
          if (
            artistId === undefined ||
            artist === undefined ||
            artist === null
          ) {
            return;
          }
          const id = artistId as Id<"artists">;
          if (artist.isFollowed) {
            void removeFollow({ artistId: id });
            return;
          }
          void addFollow({ artistId: id });
        }}
        onPlay={actions.play}
        onPlayNext={actions.playNext}
        onAddToQueue={actions.addToQueue}
        onToggleLike={(trackId) => {
          const track = listed?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined) {
            return;
          }
          void setLiked({
            trackId: track.trackId,
            liked: !track.liked,
          });
        }}
        onViewAllTracks={() => {
          if (artistId === undefined) {
            return;
          }
          router.push(libraryArtistTracksHref(artistId));
        }}
        onSupport={() => {
          Alert.alert(
            "Support",
            "Paying to support an artist is not available on this screen."
          );
        }}
      />
    </>
  );
};

export default ArtistRoute;
