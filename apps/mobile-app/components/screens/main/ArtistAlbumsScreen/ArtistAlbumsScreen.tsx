import React from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import type { ArtistAlbumSummary } from "../../../catalog/ArtistAlbumsSection/ArtistAlbumsSection";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import CoverImage from "../../../ui/CoverImage/CoverImage";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import ArtistAlbumsScreenSkeleton from "./ArtistAlbumsScreenSkeleton";

const GAP = 12;
const PAGE_PAD = 24;

interface ArtistAlbumsScreenProps {
  albums: ArtistAlbumSummary[];
  isLoading: boolean;
  onOpenAlbum: (releaseId: string) => void;
}

const ArtistAlbumsScreen: React.FC<ArtistAlbumsScreenProps> = ({
  albums,
  isLoading,
  onOpenAlbum,
}) => {
  const insets = useAppInsets();
  const { width } = useWindowDimensions();
  const tileWidth = Math.floor((width - PAGE_PAD * 2 - GAP) / 2);

  if (isLoading) {
    return <ArtistAlbumsScreenSkeleton />;
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <VStack spacing="md" paddingX="lg" paddingY="md">
        {albums.length === 0 ? (
          <CollectionEmptyState
            icon="disc"
            title="No albums yet"
            subtitle="EPs and albums this artist publishes show up here."
          />
        ) : (
          <HStack spacing="none" className="flex-wrap" style={{ gap: GAP }}>
            {albums.map((album) => (
              <Pressable
                key={album.releaseId}
                accessibilityRole="button"
                accessibilityLabel={`${album.title}, ${album.type === "ep" ? "EP" : "album"}, ${album.trackCount} tracks`}
                onPress={() => onOpenAlbum(album.releaseId)}
                style={{ width: tileWidth }}
              >
                <VStack spacing="xs">
                  <CoverImage
                    uri={album.artworkUrl}
                    width={tileWidth}
                    height={tileWidth}
                    radius={12}
                    accessibilityLabel=""
                  />
                  <Text
                    className="font-app-medium text-sm text-text"
                    numberOfLines={1}
                  >
                    {album.title}
                  </Text>
                  <Text className="text-xs text-text/50" numberOfLines={1}>
                    {album.type === "ep" ? "EP" : "Album"} · {album.trackCount}{" "}
                    tracks
                  </Text>
                </VStack>
              </Pressable>
            ))}
          </HStack>
        )}
      </VStack>
    </ScrollView>
  );
};

export default ArtistAlbumsScreen;
