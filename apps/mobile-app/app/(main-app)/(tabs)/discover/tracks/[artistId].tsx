import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { PopularTracksScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import { routeParam, trackHref } from "@/utils";

const ArtistTracksRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const artistId = routeParam(
    useLocalSearchParams<{ artistId: string }>().artistId
  );
  const artist = useQuery(
    api.artists.get,
    artistId === undefined ? "skip" : { artistId: artistId as Id<"artists"> }
  );
  const listed = useQuery(
    api.tracks.listPublishedForArtist,
    artistId === undefined ? "skip" : { artistId: artistId as Id<"artists"> }
  );

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
      <Stack.Screen options={{ title: "Popular tracks" }} />
      <PopularTracksScreen
        tracks={listed?.tracks ?? []}
        isLoading={artistId !== undefined && listed === undefined}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        onPlay={playTrack}
        onOpenLocked={(trackId) => {
          router.push(trackHref(trackId));
        }}
      />
    </>
  );
};

export default ArtistTracksRoute;
