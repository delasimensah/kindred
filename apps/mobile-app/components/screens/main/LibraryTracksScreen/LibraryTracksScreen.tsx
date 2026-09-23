import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatDuration } from "@/utils";

import PopularTrackRow from "../../../catalog/PopularTrackRow/PopularTrackRow";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export interface LibraryTrack {
  trackId: string;
  title: string;
  artistName: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  liked: boolean;
}

export interface LibraryEmptyCopy {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

interface LibraryTracksScreenProps {
  tracks: LibraryTrack[];
  isLoading: boolean;
  empty: LibraryEmptyCopy;
  playingTrackId: string | null;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onOpenLocked: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
  onRemove?: (trackId: string) => void;
  headerAction?: { label: string; onPress: () => void };
}

const LibraryTracksScreen: React.FC<LibraryTracksScreenProps> = ({
  tracks,
  isLoading,
  empty,
  playingTrackId,
  isPlaying,
  onPlay,
  onOpenLocked,
  onToggleLike,
  onRemove,
  headerAction,
}) => {
  const insets = useAppInsets();
  const { width } = useWindowDimensions();

  if (isLoading) {
    return (
      <VStack spacing="md" padding="lg" className="flex-1 bg-page">
        {headerAction ? (
          <SkeletonCard
            width={Math.max(0, width - 48)}
            height={48}
            radius={24}
          />
        ) : null}
        <VStack spacing="none">
          {TITLE_SCALES.map((titleScale, index) => (
            <PopulatedTrackSkeleton
              key={index}
              titleScale={titleScale}
              showRemove={onRemove !== undefined}
              width={width}
            />
          ))}
        </VStack>
      </VStack>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <VStack spacing="md" padding="lg">
        {headerAction && tracks.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={headerAction.label}
            onPress={headerAction.onPress}
          >
            <HStackButton label={headerAction.label} />
          </Pressable>
        ) : null}
        {tracks.length === 0 ? (
          <CollectionEmptyState
            icon={empty.icon}
            title={empty.title}
            subtitle={empty.subtitle}
            actionLabel={headerAction?.label}
            onAction={headerAction?.onPress}
          />
        ) : (
          tracks.map((track) => (
            <PopularTrackRow
              key={track.trackId}
              title={track.title}
              subtitle={
                track.locked
                  ? "Supporters only"
                  : `${track.artistName} · ${formatDuration(track.durationMs)}`
              }
              artworkUrl={track.artworkUrl}
              locked={track.locked}
              liked={track.liked}
              isPlaying={isPlaying && playingTrackId === track.trackId}
              onPlay={() => onPlay(track.trackId)}
              onOpenLocked={() => onOpenLocked(track.trackId)}
              onToggleLike={() => onToggleLike(track.trackId)}
              onRemove={
                onRemove === undefined
                  ? undefined
                  : () => onRemove(track.trackId)
              }
            />
          ))
        )}
      </VStack>
    </ScrollView>
  );
};

const TITLE_SCALES = [0.72, 0.46, 0.6, 0.38, 0.66, 0.52];

const PopulatedTrackSkeleton: React.FC<{
  titleScale: number;
  showRemove: boolean;
  width: number;
}> = ({ titleScale, showRemove, width }) => {
  const trailing = 36 + 44 + (showRemove ? 36 : 0) + 24;
  const textWidth = Math.max(80, width - 48 - 48 - trailing);

  return (
    <HStack spacing="sm" align="center" paddingY="sm">
      <SkeletonCard width={48} height={48} radius={6} />
      <VStack spacing="xs" className="min-w-0 flex-1">
        <SkeletonCard width={textWidth * titleScale} height={12} radius={4} />
        <SkeletonCard width={textWidth * 0.4} height={10} radius={4} />
      </VStack>
      <SkeletonCard width={36} height={36} radius={18} />
      <SkeletonCard width={26} height={26} radius={13} />
      {showRemove ? <SkeletonCard width={22} height={22} radius={4} /> : null}
    </HStack>
  );
};

const HStackButton: React.FC<{ label: string }> = ({ label }) => {
  return (
    <VStack
      spacing="none"
      align="center"
      justify="center"
      className="rounded-full bg-primary py-3.5"
    >
      <Text className="font-app-semibold text-sm text-textOnPrimary">
        {label}
      </Text>
    </VStack>
  );
};

export default LibraryTracksScreen;
