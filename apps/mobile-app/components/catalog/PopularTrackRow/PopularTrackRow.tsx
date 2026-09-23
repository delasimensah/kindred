import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface PopularTrackRowProps {
  title: string;
  subtitle: string;
  artworkUrl: string | null;
  locked: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onOpenLocked: () => void;
}

const PopularTrackRow: React.FC<PopularTrackRowProps> = ({
  title,
  subtitle,
  artworkUrl,
  locked,
  isPlaying,
  onPlay,
  onOpenLocked,
}) => {
  const label = locked
    ? `${title}, supporters only`
    : isPlaying
      ? `Pause ${title}`
      : `Play ${title}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={locked ? onOpenLocked : onPlay}
    >
      <HStack spacing="sm" align="center" paddingY="sm">
        {artworkUrl ? (
          <Image
            accessibilityLabel=""
            source={{ uri: artworkUrl }}
            contentFit="cover"
            style={{
              width: 48,
              height: 48,
              borderRadius: 6,
              backgroundColor: COLORS.surface,
              opacity: locked ? 0.45 : 1,
            }}
          />
        ) : (
          <VStack spacing="none" className="h-12 w-12 rounded-md bg-surface" />
        )}
        <VStack spacing="none" className="min-w-0 flex-1">
          <Text
            className={
              isPlaying && !locked
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
        <HStack
          spacing="none"
          align="center"
          justify="center"
          className={
            locked
              ? "h-9 w-9 rounded-full bg-surface"
              : "h-9 w-9 rounded-full bg-primary"
          }
        >
          <Ionicons
            name={locked ? "lock-closed" : isPlaying ? "pause" : "play"}
            size={14}
            color={locked ? COLORS.primary : COLORS.textOnPrimary}
          />
        </HStack>
      </HStack>
    </Pressable>
  );
};

export default PopularTrackRow;
