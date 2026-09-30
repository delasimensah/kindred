import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Stack, useRouter } from "expo-router";

import { LibraryTracksScreen } from "@/components";
import { usePreviewPlayer } from "@/hooks";
import {
  bindQueueActions,
  catalogQueue,
  coverHeaderScreenOptions,
  lockedTrackHref,
} from "@/utils";

const LikedRoute = () => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const tracks = useQuery(api.library.listLiked, {});
  const setLiked = useMutation(api.library.setLiked);
  const actions = bindQueueActions(
    player,
    catalogQueue("library", "", undefined, tracks ?? [])
  );

  return (
    <>
      <Stack.Screen options={coverHeaderScreenOptions} />
      <LibraryTracksScreen
        collection={{
          title: "Liked songs",
          fallbackIcon: "heart",
          detail:
            tracks === undefined
              ? ""
              : tracks.length === 1
                ? "1 liked track"
                : `${tracks.length} liked tracks`,
          artworkUrls: (tracks ?? []).flatMap((track) =>
            track.artworkUrl ? [track.artworkUrl] : []
          ),
        }}
        tracks={tracks ?? []}
        isLoading={tracks === undefined}
        empty={{
          icon: "heart",
          title: "No liked songs yet",
          subtitle: "Tap the heart on a track and it stays here.",
        }}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        onPlay={actions.play}
        onPlayNext={actions.playNext}
        onAddToQueue={actions.addToQueue}
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
        onOpenLocked={(trackId) => {
          const track = tracks?.find((row) => row.trackId === trackId);
          if (track === undefined) {
            return;
          }
          router.push(
            lockedTrackHref({
              title: track.title,
              artistName: track.artistName,
              artistId: track.artistId,
              artworkUrl: track.artworkUrl,
            })
          );
        }}
      />
    </>
  );
};

export default LikedRoute;
