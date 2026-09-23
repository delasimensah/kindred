import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Alert, Pressable } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface PopularTrackRowProps {
  title: string;
  subtitle: string;
  artworkUrl: string | null;
  locked: boolean;
  isPlaying: boolean;
  liked?: boolean;
  onPlay: () => void;
  onOpenLocked: () => void;
  onToggleLike?: () => void;
  onRemove?: () => void;
}

const PopularTrackRow: React.FC<PopularTrackRowProps> = ({
  title,
  subtitle,
  artworkUrl,
  locked,
  isPlaying,
  liked = false,
  onPlay,
  onOpenLocked,
  onToggleLike,
  onRemove,
}) => {
  const label = locked
    ? `${title}, supporters only`
    : isPlaying
      ? `Pause ${title}`
      : `Play ${title}`;

  return (
    <HStack spacing="sm" align="center" paddingY="sm">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={locked ? onOpenLocked : onPlay}
        style={{ flex: 1, minWidth: 0 }}
      >
        <HStack spacing="sm" align="center">
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
            <VStack
              spacing="none"
              className="h-12 w-12 rounded-md bg-surface"
            />
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
      {onToggleLike ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? `Unlike ${title}` : `Like ${title}`}
          onPress={onToggleLike}
        >
          <HStack
            spacing="none"
            align="center"
            justify="center"
            className="h-11 w-11"
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={26}
              color={COLORS.primary}
            />
          </HStack>
        </Pressable>
      ) : null}
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${title}`}
          onPress={() => {
            confirmDeleteTrack(title, onRemove);
          }}
        >
          <HStack
            spacing="none"
            align="center"
            justify="center"
            className="h-9 w-9"
          >
            <Ionicons name="close" size={22} color={COLORS.danger} />
          </HStack>
        </Pressable>
      ) : null}
    </HStack>
  );
};

function confirmDeleteTrack(title: string, onRemove: () => void) {
  Alert.alert("Delete track", `Are you sure you want to delete ${title}?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onRemove },
  ]);
}

export default PopularTrackRow;
