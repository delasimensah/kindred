import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { ArtistProfileScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import {
  artistTracksHref,
  coverHeaderScreenOptions,
  POPULAR_TRACK_PREVIEW,
  routeParam,
  trackHref,
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

  const playTrack = (trackId: string) => {
    const track = listed?.tracks.find((row) => row.trackId === trackId);
    if (track === undefined || artist === undefined || artist === null) {
      return;
    }
    player.play({
      trackId: track.trackId,
      title: track.title,
      artistName: artist.name,
    });
  };

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
        onPlay={playTrack}
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
        onOpenLocked={(trackId) => {
          router.push(trackHref(trackId));
        }}
        onViewAllTracks={() => {
          if (artistId === undefined) {
            return;
          }
          router.push(artistTracksHref(artistId));
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
