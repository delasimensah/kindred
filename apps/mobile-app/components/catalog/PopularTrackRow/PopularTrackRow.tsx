import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Alert, Pressable } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import TrackMenu from "../TrackMenu/TrackMenu";

interface PopularTrackRowProps {
  trackId: string;
  title: string;
  subtitle: string;
  artworkUrl: string | null;
  locked: boolean;
  isPlaying: boolean;
  liked?: boolean;
  onPlay: () => void;
  onPlayNext?: () => void;
  onAddToQueue?: () => void;
  onToggleLike?: () => void;
  onRemove?: () => void;
}

const PopularTrackRow: React.FC<PopularTrackRowProps> = ({
  trackId,
  title,
  subtitle,
  artworkUrl,
  locked,
  isPlaying,
  liked = false,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
  onRemove,
}) => {
  const playing = isPlaying && !locked;
  const label = locked
    ? `${title}, supporters only`
    : playing
      ? `Pause ${title}`
      : `Play ${title}`;

  return (
    <HStack spacing="sm" align="center" paddingY="sm">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: locked }}
        disabled={locked}
        onPress={() => {
          if (locked) {
            return;
          }
          onPlay();
        }}
        style={{ flex: 1, minWidth: 0 }}
      >
        <HStack spacing="sm" align="center">
          <VStack
            spacing="none"
            align="center"
            justify="center"
            className="h-12 w-12 overflow-hidden rounded-md bg-surface"
          >
            {artworkUrl ? (
              <Image
                accessibilityLabel=""
                source={{ uri: artworkUrl }}
                contentFit="cover"
                style={{
                  position: "absolute",
                  width: 48,
                  height: 48,
                  opacity: locked ? 0.45 : 1,
                }}
              />
            ) : null}
            {playing ? <Equalizer /> : null}
            {locked ? (
              <Ionicons name="lock-closed" size={14} color={COLORS.primary} />
            ) : null}
          </VStack>
          <VStack spacing="none" className="min-w-0 flex-1">
            <Text
              className={
                playing
                  ? "font-app-medium text-sm text-primary"
                  : locked
                    ? "font-app-medium text-sm text-text/50"
                    : "font-app-medium text-sm text-text"
              }
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text className="text-xs text-text/50" numberOfLines={1}>
              {subtitle}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
      <TrackMenu
        title={title}
        trackId={trackId}
        artworkUrl={artworkUrl}
        liked={liked}
        onPlayNext={onPlayNext}
        onAddToQueue={onAddToQueue}
        onToggleLike={onToggleLike}
        disabled={locked}
        onRemove={
          onRemove === undefined
            ? undefined
            : () => {
                confirmDeleteTrack(title, onRemove);
              }
        }
      />
    </HStack>
  );
};

function Equalizer() {
  const heights = [8, 14, 10];
  return (
    <HStack
      spacing="none"
      align="center"
      justify="center"
      className="absolute inset-0 gap-[3px]"
      style={{ backgroundColor: "rgba(34,40,49,0.45)" }}
    >
      {heights.map((height) => (
        <VStack
          key={height}
          spacing="none"
          className="w-[3px] rounded-sm bg-primary"
          style={{ height }}
        />
      ))}
    </HStack>
  );
}

function confirmDeleteTrack(title: string, onRemove: () => void) {
  Alert.alert("Delete track", `Are you sure you want to delete ${title}?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onRemove },
  ]);
}

export default PopularTrackRow;
