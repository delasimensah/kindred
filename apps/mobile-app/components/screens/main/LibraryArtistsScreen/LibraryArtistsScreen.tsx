import React from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export interface FollowedArtist {
  artistId: string;
  name: string;
  avatarUrl: string | null;
}

interface LibraryArtistsScreenProps {
  artists: FollowedArtist[];
  isLoading: boolean;
  onOpen: (artistId: string) => void;
}

const LibraryArtistsScreen: React.FC<LibraryArtistsScreenProps> = ({
  artists,
  isLoading,
  onOpen,
}) => {
  const insets = useAppInsets();
  const { width } = useWindowDimensions();
  const rowWidth = Math.max(0, width - 48);

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <VStack spacing="sm" padding="lg">
        {isLoading || artists.length > 0 ? (
          <Text className="text-xs uppercase tracking-wide text-text/40">
            {isLoading ? "Artists" : `Artists · ${artists.length} followed`}
          </Text>
        ) : null}
        {isLoading ? (
          <VStack spacing="sm">
            {[0.46, 0.62, 0.38].map((scale, index) => (
              <HStack
                key={index}
                spacing="md"
                align="center"
                padding="sm"
                className="rounded-2xl bg-surface"
              >
                <SkeletonCard width={48} height={48} radius={24} />
                <SkeletonCard
                  width={Math.max(80, (rowWidth - 80) * scale)}
                  height={14}
                  radius={4}
                />
              </HStack>
            ))}
          </VStack>
        ) : artists.length === 0 ? (
          <CollectionEmptyState
            icon="people"
            title="No artists yet"
            subtitle="Follow an artist and they show up here."
          />
        ) : (
          artists.map((artist) => (
            <Pressable
              key={artist.artistId}
              accessibilityRole="button"
              accessibilityLabel={artist.name}
              onPress={() => onOpen(artist.artistId)}
            >
              <HStack
                spacing="md"
                align="center"
                padding="sm"
                className="rounded-2xl bg-surface"
              >
                <PersonAvatar
                  displayName={artist.name}
                  imageUrl={artist.avatarUrl}
                  size={48}
                />
                <Text
                  className="min-w-0 flex-1 font-app-semibold text-sm text-text"
                  numberOfLines={1}
                >
                  {artist.name}
                </Text>
              </HStack>
            </Pressable>
          ))
        )}
      </VStack>
    </ScrollView>
  );
};

export default LibraryArtistsScreen;
