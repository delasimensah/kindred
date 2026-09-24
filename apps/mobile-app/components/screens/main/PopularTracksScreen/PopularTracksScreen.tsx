import React from "react";
import { ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatDuration } from "@/utils";

import PopularTrackRow from "../../../catalog/PopularTrackRow/PopularTrackRow";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { VStack } from "../../../ui/Stack/Stack";
import PopularTracksScreenSkeleton from "./PopularTracksScreenSkeleton";

export interface PopularTrack {
  trackId: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  liked: boolean;
}

interface PopularTracksScreenProps {
  tracks: PopularTrack[];
  isLoading: boolean;
  playingTrackId: string | null;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onPlayNext?: (trackId: string) => void;
  onAddToQueue?: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
}

const PopularTracksScreen: React.FC<PopularTracksScreenProps> = ({
  tracks,
  isLoading,
  playingTrackId,
  isPlaying,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
}) => {
  const insets = useAppInsets();

  if (isLoading) {
    return <PopularTracksScreenSkeleton />;
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <VStack spacing="none" paddingX="lg">
        {tracks.length === 0 ? (
          <CollectionEmptyState
            icon="musical-notes"
            title="No published tracks yet"
            subtitle="Tracks this artist publishes show up here."
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
            />
          ))
        )}
      </VStack>
    </ScrollView>
  );
};

export default PopularTracksScreen;
