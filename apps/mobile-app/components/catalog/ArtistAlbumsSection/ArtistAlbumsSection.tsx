import React from "react";
import { Pressable, ScrollView } from "react-native";

import CoverImage from "../../ui/CoverImage/CoverImage";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

export interface ArtistAlbumSummary {
  releaseId: string;
  title: string;
  type: "ep" | "album";
  artworkUrl: string | null;
  trackCount: number;
}

interface ArtistAlbumsSectionProps {
  albums: ArtistAlbumSummary[];
  hasMore: boolean;
  onOpenAlbum: (releaseId: string) => void;
  onViewAll: () => void;
}

const ArtistAlbumsSection: React.FC<ArtistAlbumsSectionProps> = ({
  albums,
  hasMore,
  onOpenAlbum,
  onViewAll,
}) => {
  if (albums.length === 0) {
    return null;
  }

  return (
    <VStack spacing="sm">
      <HStack spacing="sm" align="center" justify="between">
        <Text className="font-app-semibold text-lg text-text">Albums</Text>
        {hasMore ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all albums"
            onPress={onViewAll}
          >
            <Text className="font-app-semibold text-sm text-primary">
              View all
            </Text>
          </Pressable>
        ) : null}
      </HStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 8 }}
      >
        {albums.map((album) => (
          <Pressable
            key={album.releaseId}
            accessibilityRole="button"
            accessibilityLabel={`${album.title}, ${album.type === "ep" ? "EP" : "album"}, ${album.trackCount} tracks`}
            onPress={() => onOpenAlbum(album.releaseId)}
            className="w-32"
          >
            <VStack spacing="xs">
              <CoverImage
                uri={album.artworkUrl}
                width={128}
                height={128}
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
      </ScrollView>
    </VStack>
  );
};

export default ArtistAlbumsSection;
