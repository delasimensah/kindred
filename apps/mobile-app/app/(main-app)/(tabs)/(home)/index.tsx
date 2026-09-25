import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import {
  type HomeFeedPost,
  type HomeFeedRelease,
  HomeTabScreen,
} from "@/components";
import {
  STAND_IN_TRACK_ID,
  useFanSession,
  usePreviewPlayer,
  useVoiceNote,
} from "@/hooks";
import { ACCOUNT_HREF, homeArtistHref } from "@/utils";

const HomeRoute = () => {
  const router = useRouter();
  const { displayName } = useFanSession();
  const feed = useQuery(api.feed.listForMe, {});
  const player = usePreviewPlayer();
  const voice = useVoiceNote();
  const [now] = useState(() => Date.now());

  const items: (HomeFeedPost | HomeFeedRelease)[] = (feed ?? []).map((item) => {
    if (item.kind === "release") {
      return {
        kind: "release",
        id: item.trackId,
        artistId: item.artistId,
        artistName: item.artistName,
        avatarUrl: item.avatarUrl,
        createdAt: item.createdAt,
        title: item.title,
        artworkUrl: item.artworkUrl,
        durationMs: item.durationMs,
        locked: item.locked,
        peaks: item.peaks,
      };
    }
    return {
      kind: "post",
      id: item.postId,
      artistId: item.artistId,
      artistName: item.artistName,
      avatarUrl: item.avatarUrl,
      createdAt: item.createdAt,
      audience: item.audience,
      body: item.body,
      locked: item.locked,
      photoUrl: item.photoUrl,
      voiceDurationMs: item.voiceDurationMs,
      voiceUrl: item.voiceUrl,
      voicePeaks: item.voicePeaks,
    };
  });

  const releaseById = (trackId: string) => {
    const item = items.find(
      (row) => row.kind === "release" && row.id === trackId
    );
    if (item === undefined || item.kind !== "release" || item.locked) {
      return undefined;
    }
    return {
      trackId: item.id,
      title: item.title,
      artistName: item.artistName,
      artistId: item.artistId,
      artworkUrl: item.artworkUrl,
      durationMs: item.durationMs,
      locked: item.locked,
      peaks: item.peaks,
      source: "feed" as const,
    };
  };

  const loadedTrackId =
    player.track.trackId === STAND_IN_TRACK_ID ? null : player.track.trackId;

  const stopVoice = () => {
    if (voice.playingUrl !== null) {
      voice.toggle(voice.playingUrl);
    }
  };

  const pauseMusic = () => {
    if (player.isPlaying) {
      player.pause();
    }
  };

  return (
    <HomeTabScreen
      displayName={displayName}
      items={items}
      isLoading={feed === undefined}
      now={now}
      playingTrackId={player.isPlaying ? loadedTrackId : null}
      playingVoiceUrl={voice.playingUrl}
      voiceActiveUrl={voice.activeUrl}
      voiceProgress={voice.progress}
      heldVoiceUrl={voice.heldUrl}
      heldVoiceRatio={voice.heldRatio}
      onOpenAccount={() => {
        router.push(ACCOUNT_HREF);
      }}
      onOpenArtist={(artistId) => {
        router.push(homeArtistHref(artistId));
      }}
      onPlayTrack={(trackId) => {
        const track = releaseById(trackId);
        if (track === undefined) {
          return;
        }
        stopVoice();
        const alone =
          player.track.trackId === trackId && player.upcoming.length === 0;
        if (alone) {
          player.toggle();
          return;
        }
        player.playAlone(track);
      }}
      onToggleVoice={(url) => {
        voice.toggle(url, pauseMusic);
      }}
      onSeekVoice={(url, ratio) => {
        voice.seek(url, ratio);
      }}
      onSupport={(artistName) => {
        Alert.alert(
          "Support",
          `Paying to support ${artistName} is not available on this screen.`
        );
      }}
    />
  );
};

export default HomeRoute;
