import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";

import { TrackDetailScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import { libraryArtistHref, routeParam } from "@/utils";

const TrackRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const trackId = routeParam(
    useLocalSearchParams<{ trackId: string }>().trackId
  );
  const track = useQuery(
    api.tracks.get,
    trackId === undefined ? "skip" : { trackId: trackId as Id<"tracks"> }
  );
  const isCurrent =
    track !== undefined &&
    track !== null &&
    player.track.trackId === track.trackId;

  return (
    <>
      <Stack.Screen options={{ title: track?.title ?? "Track" }} />
      <TrackDetailScreen
        track={track ?? null}
        isLoading={trackId !== undefined && track === undefined}
        isPlaying={isCurrent && player.isPlaying}
        onOpenArtist={() => {
          if (track === undefined || track === null) {
            return;
          }
          router.push(libraryArtistHref(track.artistId));
        }}
        onPlay={() => {
          if (track === undefined || track === null || track.locked) {
            return;
          }
          player.play({
            trackId: track.trackId,
            title: track.title,
            artistName: track.artistName,
          });
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

export default TrackRoute;
