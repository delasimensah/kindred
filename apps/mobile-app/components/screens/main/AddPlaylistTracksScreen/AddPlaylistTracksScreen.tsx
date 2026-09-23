import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatDuration } from "@/utils";

import PopularTrackRowSkeleton from "../../../catalog/PopularTrackRow/PopularTrackRowSkeleton";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import type { LibraryTrack } from "../LibraryTracksScreen/LibraryTracksScreen";

interface AddPlaylistTracksScreenProps {
  tracks: LibraryTrack[];
  isLoading: boolean;
  onAdd: (trackId: string) => void;
}

const AddPlaylistTracksScreen: React.FC<AddPlaylistTracksScreenProps> = ({
  tracks,
  isLoading,
  onAdd,
}) => {
  const insets = useAppInsets();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <VStack spacing="sm" padding="lg">
        {isLoading ? (
          <VStack spacing="none">
            <PopularTrackRowSkeleton />
            <PopularTrackRowSkeleton titleScale={0.46} />
            <PopularTrackRowSkeleton titleScale={0.6} />
          </VStack>
        ) : tracks.length === 0 ? (
          <CollectionEmptyState
            icon="checkmark-circle"
            title="Nothing to add"
            subtitle="Public tracks you can add are already in this playlist."
          />
        ) : (
          tracks.map((track) => (
            <Pressable
              key={track.trackId}
              accessibilityRole="button"
              accessibilityLabel={`Add ${track.title}`}
              onPress={() => onAdd(track.trackId)}
            >
              <HStack spacing="md" align="center" paddingY="sm">
                {track.artworkUrl ? (
                  <Image
                    accessibilityLabel=""
                    source={{ uri: track.artworkUrl }}
                    contentFit="cover"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      backgroundColor: COLORS.surface,
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
                    className="font-app-medium text-sm text-text"
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text className="text-xs text-text/50" numberOfLines={1}>
                    {`${track.artistName} · ${formatDuration(track.durationMs)}`}
                  </Text>
                </VStack>
                <HStack
                  spacing="none"
                  align="center"
                  justify="center"
                  className="h-9 w-9 rounded-full bg-primary"
                >
                  <Ionicons name="add" size={20} color={COLORS.textOnPrimary} />
                </HStack>
              </HStack>
            </Pressable>
          ))
        )}
      </VStack>
    </ScrollView>
  );
};

export default AddPlaylistTracksScreen;
