import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatDuration } from "@/utils";

import TrackSupportGate from "../../../catalog/TrackSupportGate/TrackSupportGate";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export interface TrackDetail {
  title: string;
  artistName: string;
  artistAvatarUrl: string | null;
  artworkUrl: string | null;
  durationMs: number;
  visibility: "public" | "supporters";
  description: string | null;
  locked: boolean;
}

interface TrackDetailScreenProps {
  track: TrackDetail | null;
  isLoading: boolean;
  isPlaying: boolean;
  onOpenArtist: () => void;
  onPlay: () => void;
  onSupport: () => void;
}

/**
 * Supporters-only tracks land here. Public tracks play from the row.
 * Locked artwork stays visible but softened.
 * https://docs.expo.dev/versions/latest/sdk/image/
 */
const TrackDetailScreen: React.FC<TrackDetailScreenProps> = ({
  track,
  isLoading,
  isPlaying,
  onOpenArtist,
  onPlay,
  onSupport,
}) => {
  const insets = useAppInsets();

  if (isLoading) {
    return (
      <VStack spacing="lg" padding="lg" className="flex-1 bg-page">
        <SkeletonCard width={96} height={96} radius={12} />
        <SkeletonCard width={180} height={22} radius={6} />
        <SkeletonCard width={280} height={160} radius={24} />
      </VStack>
    );
  }

  if (track === null) {
    return (
      <VStack spacing="md" padding="lg" className="flex-1 bg-page">
        <CollectionEmptyState
          icon="musical-notes"
          title="Track not available"
          subtitle="This track may be hidden, or the link is no longer valid."
        />
      </VStack>
    );
  }

  const audienceLabel =
    track.visibility === "supporters" ? "Supporters only" : "Public";
  const playLabel = isPlaying ? `Pause ${track.title}` : `Play ${track.title}`;

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <VStack spacing="lg" padding="lg">
        <HStack spacing="md" align="center">
          {track.artworkUrl ? (
            <Image
              accessibilityLabel=""
              source={{ uri: track.artworkUrl }}
              contentFit="cover"
              blurRadius={track.locked ? 24 : 0}
              style={{
                width: 96,
                height: 96,
                borderRadius: 12,
                backgroundColor: COLORS.surface,
                opacity: track.locked ? 0.55 : 1,
              }}
            />
          ) : (
            <VStack
              spacing="none"
              className="h-24 w-24 rounded-xl bg-surface"
            />
          )}
          <VStack spacing="sm" className="min-w-0 flex-1">
            <Text
              className="font-display-bold text-xl text-text"
              numberOfLines={2}
            >
              {track.title}
            </Text>
            <HStack spacing="sm" align="center">
              <PersonAvatar
                displayName={track.artistName}
                imageUrl={track.artistAvatarUrl}
                size={20}
              />
              <Text
                accessibilityRole="button"
                className="text-sm text-text/60"
                onPress={onOpenArtist}
              >
                {track.artistName}
              </Text>
            </HStack>
            <Text className="text-xs text-text/50">
              {audienceLabel}
              {track.locked ? "" : ` · ${formatDuration(track.durationMs)}`}
            </Text>
          </VStack>
        </HStack>
        {track.locked ? (
          <>
            <TrackSupportGate
              artistName={track.artistName}
              onSupport={onSupport}
            />
            <VStack spacing="sm">
              <Text className="font-app-semibold text-sm text-text">
                About this release
              </Text>
              <Text className="text-sm text-text/50">
                The note on this release stays hidden.
              </Text>
            </VStack>
          </>
        ) : (
          <VStack spacing="md">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playLabel}
              onPress={onPlay}
            >
              <HStack spacing="sm" align="center">
                <HStack
                  spacing="none"
                  align="center"
                  justify="center"
                  className="h-12 w-12 rounded-full bg-primary"
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={18}
                    color={COLORS.textOnPrimary}
                  />
                </HStack>
                <Text className="font-app-semibold text-base text-text">
                  {isPlaying ? "Pause" : "Play"}
                </Text>
              </HStack>
            </Pressable>
            {track.description ? (
              <VStack spacing="sm">
                <Text className="font-app-semibold text-sm text-text">
                  About this release
                </Text>
                <Text className="text-sm text-text/60">
                  {track.description}
                </Text>
              </VStack>
            ) : null}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
};

export default TrackDetailScreen;
