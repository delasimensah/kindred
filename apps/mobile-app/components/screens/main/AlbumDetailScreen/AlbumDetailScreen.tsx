import React from "react";
import { ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatDuration } from "@/utils";

import PopularTrackRow from "../../../catalog/PopularTrackRow/PopularTrackRow";
import LibraryCollectionHeader from "../../../library/LibraryCollectionHeader/LibraryCollectionHeader";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { VStack } from "../../../ui/Stack/Stack";
import AlbumDetailScreenSkeleton from "./AlbumDetailScreenSkeleton";

export interface AlbumDetailTrack {
  trackId: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  liked: boolean;
}

interface AlbumDetailScreenProps {
  title: string | null;
  typeLabel: string | null;
  artistName: string | null;
  artworkUrl: string | null;
  tracks: AlbumDetailTrack[];
  isLoading: boolean;
  playingTrackId: string | null;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onPlayNext?: (trackId: string) => void;
  onAddToQueue?: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
  onOpenLocked?: (trackId: string) => void;
  onPlayAll?: () => void;
}

const AlbumDetailScreen: React.FC<AlbumDetailScreenProps> = ({
  title,
  typeLabel,
  artistName,
  artworkUrl,
  tracks,
  isLoading,
  playingTrackId,
  isPlaying,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
  onOpenLocked,
  onPlayAll,
}) => {
  const insets = useAppInsets();

  if (isLoading) {
    return <AlbumDetailScreenSkeleton />;
  }

  if (title === null) {
    return (
      <VStack
        spacing="md"
        padding="lg"
        className="flex-1 bg-page"
        style={{ paddingTop: insets.top }}
      >
        <CollectionEmptyState
          icon="disc"
          title="Album not available"
          subtitle="This release may be hidden, or the link is no longer valid."
        />
      </VStack>
    );
  }

  const detail = [typeLabel, artistName].filter(Boolean).join(" · ");

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <LibraryCollectionHeader
        collection={{
          title,
          detail,
          artworkUrls: artworkUrl ? [artworkUrl] : [],
          fallbackIcon: "disc",
        }}
        onPlayAll={onPlayAll}
      />
      <VStack spacing="none" paddingX="lg" paddingY="md">
        {tracks.length === 0 ? (
          <CollectionEmptyState
            compact
            icon="musical-notes"
            title="No tracks yet"
            subtitle="Tracks on this release show up here."
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
                  : formatDuration(track.durationMs)
              }
              artworkUrl={track.artworkUrl}
              locked={track.locked}
              onOpenLocked={
                onOpenLocked === undefined
                  ? undefined
                  : () => onOpenLocked(track.trackId)
              }
              liked={track.liked}
              isPlaying={isPlaying && playingTrackId === track.trackId}
              onPlay={() => onPlay(track.trackId)}
              onPlayNext={
                onPlayNext ? () => onPlayNext(track.trackId) : undefined
              }
              onAddToQueue={
                onAddToQueue ? () => onAddToQueue(track.trackId) : undefined
              }
              onToggleLike={() => onToggleLike(track.trackId)}
            />
          ))
        )}
      </VStack>
    </ScrollView>
  );
};

export default AlbumDetailScreen;
