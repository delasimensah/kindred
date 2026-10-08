import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import GenreScreen from "@/components/screens/main/GenreScreen/GenreScreen";
import { usePreviewPlayer } from "@/hooks";
import { bindQueueActions, routeParam, searchArtistHref } from "@/utils";

const GenreRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const genre =
    routeParam(useLocalSearchParams<{ genre: string }>().genre) ?? "";
  const page = useQuery(api.genres.page, genre === "" ? "skip" : { genre });
  const tracks = page?.tracks ?? [];
  const actions = bindQueueActions(
    player,
    tracks.map((track) => ({
      trackId: track.trackId,
      title: track.title,
      artistName: track.artistName,
      artistId: track.artistId,
      artworkUrl: track.artworkUrl,
      durationMs: track.durationMs,
      locked: false,
      source: "search" as const,
    }))
  );

  return (
    <>
      <Stack.Screen options={{ title: genre }} />
      <GenreScreen
        isLoading={page === undefined}
        artists={page?.artists ?? []}
        tracks={tracks}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        onOpenArtist={(artistId) => {
          router.push(searchArtistHref(artistId));
        }}
        onPlay={actions.play}
      />
    </>
  );
};

export default GenreRoute;
