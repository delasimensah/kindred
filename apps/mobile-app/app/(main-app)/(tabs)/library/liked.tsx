import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";

import { LibraryTracksScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import { libraryTrackHref } from "@/utils";

const LikedRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const tracks = useQuery(api.library.listLiked, {});
  const setLiked = useMutation(api.library.setLiked);

  return (
    <>
      <Stack.Screen options={{ title: "Liked songs" }} />
      <LibraryTracksScreen
        tracks={tracks ?? []}
        isLoading={tracks === undefined}
        empty={{
          icon: "heart",
          title: "No liked songs yet",
          subtitle: "Tap the heart on a track and it stays here.",
        }}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        onPlay={(trackId) => {
          const track = tracks?.find((row) => row.trackId === trackId);
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
          const track = tracks?.find((row) => row.trackId === trackId);
          if (track === undefined) {
            return;
          }
          void setLiked({
            trackId: track.trackId as Id<"tracks">,
            liked: !track.liked,
          });
        }}
      />
    </>
  );
};

export default LikedRoute;
