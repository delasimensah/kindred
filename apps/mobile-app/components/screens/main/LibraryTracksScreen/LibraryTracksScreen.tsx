import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatDuration } from "@/utils";

import PopularTrackRow from "../../../catalog/PopularTrackRow/PopularTrackRow";
import PopularTrackRowSkeleton from "../../../catalog/PopularTrackRow/PopularTrackRowSkeleton";
import LibraryCollectionHeader, {
  COLLECTION_HERO_HEIGHT,
  type LibraryCollection,
} from "../../../library/LibraryCollectionHeader/LibraryCollectionHeader";
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
  onPlayNext?: (trackId: string) => void;
  onAddToQueue?: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
  onRemove?: (trackId: string) => void;
  headerAction?: { label: string; onPress: () => void };
  collection?: LibraryCollection;
}

const LibraryTracksScreen: React.FC<LibraryTracksScreenProps> = ({
  tracks,
  isLoading,
  empty,
  playingTrackId,
  isPlaying,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
  onRemove,
  headerAction,
  collection,
}) => {
  const insets = useAppInsets();
  const { width } = useWindowDimensions();
  const firstPlayable = tracks.find((track) => !track.locked);

  if (isLoading) {
    return (
      <VStack spacing="none" className="flex-1 bg-page">
        {collection ? (
          <View
            style={{
              width,
              height: COLLECTION_HERO_HEIGHT,
              backgroundColor: COLORS.surface,
            }}
          >
            <HStack
              align="end"
              justify="between"
              className="absolute bottom-5 left-0 right-0 px-6"
            >
              <VStack spacing="xs" className="min-w-0 flex-1 pr-4">
                <SkeletonCard
                  width={Math.min(220, width - 120)}
                  height={28}
                  radius={6}
                />
                <SkeletonCard
                  width={Math.min(148, width - 120)}
                  height={12}
                  radius={4}
                />
              </VStack>
              <SkeletonCard width={56} height={56} radius={28} />
            </HStack>
          </View>
        ) : headerAction ? (
          <VStack padding="lg">
            <SkeletonCard
              width={Math.max(0, width - 48)}
              height={48}
              radius={24}
            />
          </VStack>
        ) : null}
        <VStack spacing="none" paddingX="lg" paddingY="md">
          {TITLE_SCALES.map((titleScale) => (
            <PopularTrackRowSkeleton key={titleScale} titleScale={titleScale} />
          ))}
        </VStack>
      </VStack>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior={collection ? "never" : "automatic"}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      {collection ? (
        <LibraryCollectionHeader
          collection={collection}
          onPlayAll={
            firstPlayable === undefined
              ? undefined
              : () => onPlay(firstPlayable.trackId)
          }
        />
      ) : null}
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
              trackId={track.trackId}
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
              onPlayNext={
                onPlayNext === undefined
                  ? undefined
                  : () => onPlayNext(track.trackId)
              }
              onAddToQueue={
                onAddToQueue === undefined
                  ? undefined
                  : () => onAddToQueue(track.trackId)
              }
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
