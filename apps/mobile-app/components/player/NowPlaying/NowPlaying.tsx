import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants";
import { type QueueTrack, type RepeatMode, STAND_IN_TRACK_ID } from "@/hooks";
import { formatDuration } from "@/utils";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import NowPlayingHero from "../NowPlayingHero/NowPlayingHero";
import TrackReactionRow from "../TrackReactionRow/TrackReactionRow";
import WaveformScrubber from "../WaveformScrubber/WaveformScrubber";

interface NowPlayingProps {
  track: QueueTrack;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  progress: number;
  positionMs: number;
  durationMs: number;
  onClose: () => void;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (ratio: number) => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onQueue: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
  coverProgress?: SharedValue<number>;
}

const REPEAT_LABEL: Record<RepeatMode, string> = {
  off: "Repeat off",
  all: "Repeat all",
  one: "Repeat one",
};

const NowPlaying: React.FC<NowPlayingProps> = ({
  track,
  isPlaying,
  shuffle,
  repeat,
  progress,
  positionMs,
  durationMs,
  onClose,
  onToggle,
  onPrevious,
  onNext,
  onSeek,
  onShuffle,
  onRepeat,
  onQueue,
  onPlayNext,
  onAddToQueue,
  coverProgress,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const artHeight = height * 0.5;
  const playLabel = isPlaying ? "Pause" : "Play";
  const canLike = track.trackId !== STAND_IN_TRACK_ID;
  const liked = useQuery(
    api.library.isLiked,
    canLike ? { trackId: track.trackId as Id<"tracks"> } : "skip"
  );
  const setLiked = useMutation(api.library.setLiked);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.page }}>
      <NowPlayingHero
        title={track.title}
        trackId={track.trackId}
        artworkUrl={track.artworkUrl}
        height={artHeight}
        paddingTop={insets.top + 8}
        canLike={canLike}
        liked={liked === true}
        onClose={onClose}
        onPlayNext={onPlayNext}
        onAddToQueue={onAddToQueue}
        coverProgress={coverProgress}
        onToggleLike={(nextLiked) => {
          void setLiked({
            trackId: track.trackId as Id<"tracks">,
            liked: nextLiked,
          });
        }}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <HStack align="center" justify="between" className="mb-4 mt-2">
          <VStack spacing="xs" className="min-w-0 flex-1">
            <Text
              className="font-display-bold text-[26px] text-text"
              numberOfLines={1}
            >
              {track.title}
            </Text>
            <Text className="text-sm text-text/60" numberOfLines={1}>
              {track.artistName}
            </Text>
          </VStack>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              liked ? `Unlike ${track.title}` : `Like ${track.title}`
            }
            disabled={!canLike}
            onPress={() => {
              if (!canLike) {
                return;
              }
              void setLiked({
                trackId: track.trackId as Id<"tracks">,
                liked: liked !== true,
              });
            }}
            className="h-11 w-11 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={20}
              color={liked ? COLORS.primary : COLORS.text}
            />
          </Pressable>
        </HStack>

        <WaveformScrubber
          peaks={track.peaks}
          progress={progress}
          onSeek={onSeek}
        />
        <HStack justify="between" className="mt-2">
          <Text className="text-xs text-text/50">
            {formatDuration(positionMs)}
          </Text>
          <Text className="text-xs text-text/50">
            {formatDuration(durationMs)}
          </Text>
        </HStack>

        <HStack align="center" justify="between" className="mt-6 px-1">
          <TransportButton
            label={shuffle ? "Shuffle on" : "Shuffle off"}
            icon="shuffle"
            active={shuffle}
            onPress={onShuffle}
          />
          <TransportButton
            label="Previous"
            icon="play-skip-back"
            onPress={onPrevious}
            size={28}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playLabel}
            onPress={onToggle}
            className="h-[72px] w-[72px] items-center justify-center rounded-full bg-primary"
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color={COLORS.textOnPrimary}
            />
          </Pressable>
          <TransportButton
            label="Next"
            icon="play-skip-forward"
            onPress={onNext}
            size={28}
          />
          <TransportButton
            label={REPEAT_LABEL[repeat]}
            icon="repeat"
            active={repeat !== "off"}
            badge={repeat === "one" ? "1" : undefined}
            onPress={onRepeat}
          />
        </HStack>

        <TrackReactionRow trackId={track.trackId} enabled={canLike} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Queue"
          onPress={onQueue}
          className="mb-2 mt-6 flex-row items-center justify-center gap-2 rounded-full bg-surface py-3.5"
        >
          <Ionicons name="list" size={16} color={COLORS.text} />
          <Text className="font-app-semibold text-sm text-text">Queue</Text>
        </Pressable>
      </View>
    </View>
  );
};

function TransportButton({
  label,
  icon,
  onPress,
  active = false,
  size = 20,
  badge,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  size?: number;
  badge?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center"
    >
      <Ionicons
        name={icon}
        size={size}
        color={active ? COLORS.primary : COLORS.text}
      />
      {badge ? (
        <Text className="absolute right-1 top-1 text-[10px] text-primary">
          {badge}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default NowPlaying;
