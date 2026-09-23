import React from "react";
import { ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatDuration } from "@/utils";

import PopularTrackRow from "../../../catalog/PopularTrackRow/PopularTrackRow";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import PopularTracksScreenSkeleton from "./PopularTracksScreenSkeleton";

export interface PopularTrack {
  trackId: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
}

interface PopularTracksScreenProps {
  tracks: PopularTrack[];
  isLoading: boolean;
  playingTrackId: string | null;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onOpenLocked: (trackId: string) => void;
}

const PopularTracksScreen: React.FC<PopularTracksScreenProps> = ({
  tracks,
  isLoading,
  playingTrackId,
  isPlaying,
  onPlay,
  onOpenLocked,
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
          <Text className="text-sm text-text/50">No published tracks yet.</Text>
        ) : (
          tracks.map((track) => (
            <PopularTrackRow
              key={track.trackId}
              title={track.title}
              subtitle={
                track.locked
                  ? "Supporters only"
                  : formatDuration(track.durationMs)
              }
              artworkUrl={track.artworkUrl}
              locked={track.locked}
              isPlaying={isPlaying && playingTrackId === track.trackId}
              onPlay={() => onPlay(track.trackId)}
              onOpenLocked={() => onOpenLocked(track.trackId)}
            />
          ))
        )}
      </VStack>
    </ScrollView>
  );
};

export default PopularTracksScreen;
