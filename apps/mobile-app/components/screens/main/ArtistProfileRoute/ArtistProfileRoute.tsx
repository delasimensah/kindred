import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type { Href } from "expo-router";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";

import { usePreviewPlayer, useVoiceNote } from "@/hooks";
import {
  ALBUM_PREVIEW,
  bindQueueActions,
  catalogQueue,
  changeFollow,
  coverHeaderScreenOptions,
  lockedTrackHref,
  PAYWALL_HREF,
  POPULAR_TRACK_PREVIEW,
  routeParam,
} from "@/utils";

import ArtistProfileScreen from "../ArtistProfileScreen/ArtistProfileScreen";

interface ArtistProfileRouteProps {
  tracksHref: (artistId: string) => Href;
  albumsHref: (artistId: string) => Href;
  albumHref: (releaseId: string) => Href;
}

/**
 * Artist page for whichever tab opened it. Each tab has its own stack, so
 * the cover header and the back button stay on that tab.
 */
const ArtistProfileRoute: React.FC<ArtistProfileRouteProps> = ({
  tracksHref,
  albumsHref,
  albumHref,
}) => {
  const router = useRouter();
  const player = usePreviewPlayer();
  const voice = useVoiceNote();
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
  const albumsListed = useQuery(
    api.releases.listPublishedForArtist,
    artistId === undefined
      ? "skip"
      : {
          artistId: artistId as Id<"artists">,
          limit: ALBUM_PREVIEW,
        }
  );
  const updates = useQuery(api.posts.listForArtist, artistArgs);
  const addFollow = useMutation(api.follows.add);
  const removeFollow = useMutation(api.follows.remove);
  const setLiked = useMutation(api.library.setLiked);
  const [now] = useState(() => Date.now());

  const isLoading =
    artistId !== undefined &&
    (artist === undefined ||
      listed === undefined ||
      albumsListed === undefined ||
      updates === undefined);

  const queue =
    artist === undefined || artist === null
      ? []
      : catalogQueue("artist", artist.name, artistId, listed?.tracks ?? []);

  const actions = bindQueueActions(player, queue);
  const pauseMusic = () => {
    if (player.isPlaying) {
      player.pause();
    }
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
        albums={albumsListed?.albums ?? []}
        hasMoreAlbums={albumsListed?.hasMore ?? false}
        playingTrackId={player.track.trackId}
        isPlaying={player.isPlaying}
        playingVoiceUrl={voice.playingUrl}
        voiceActiveUrl={voice.activeUrl}
        voiceProgress={voice.progress}
        heldVoiceUrl={voice.heldUrl}
        heldVoiceRatio={voice.heldRatio}
        onToggleFollow={() => {
          if (
            artistId === undefined ||
            artist === undefined ||
            artist === null
          ) {
            return;
          }
          const id = artistId as Id<"artists">;
          void changeFollow(() =>
            artist.isFollowed
              ? removeFollow({ artistId: id })
              : addFollow({ artistId: id })
          );
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
          router.push(tracksHref(artistId));
        }}
        onViewAllAlbums={() => {
          if (artistId === undefined) {
            return;
          }
          router.push(albumsHref(artistId));
        }}
        onOpenAlbum={(releaseId) => {
          router.push(albumHref(releaseId));
        }}
        onSupport={() => {
          router.push(PAYWALL_HREF);
        }}
        onOpenLocked={(trackId) => {
          const track = listed?.tracks.find((row) => row.trackId === trackId);
          if (track === undefined || artist === undefined || artist === null) {
            return;
          }
          router.push(
            lockedTrackHref({
              title: track.title,
              artistName: artist.name,
              artworkUrl: track.artworkUrl,
            })
          );
        }}
        onToggleVoice={(url) => {
          voice.toggle(url, pauseMusic);
        }}
        onSeekVoice={(url, ratio) => {
          voice.seek(url, ratio);
        }}
      />
    </>
  );
};

export default ArtistProfileRoute;
