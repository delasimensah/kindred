import { Image } from "expo-image";
import React from "react";
import { Pressable, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import Text from "../../../ui/Text/Text";

export interface SearchGenreTile {
  genre: string;
  artworkUrl: string | null;
}

interface SearchGenreTilesProps {
  /** Null while the genre list loads. */
  genres: SearchGenreTile[] | null;
  onOpen: (genre: string) => void;
}

const SearchGenreTiles: React.FC<SearchGenreTilesProps> = ({
  genres,
  onOpen,
}) => {
  const { width } = useWindowDimensions();
  const tile = Math.floor((width - 48 - 12) / 2);
  const loading = genres === null;

  if (!loading && genres.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: 8 }}>
      <Text className="mb-3 font-app-semibold text-lg text-text">Genres</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <SkeletonCard
                key={index}
                width={tile}
                height={tile}
                radius={16}
              />
            ))
          : genres.map((genre) => (
              <Pressable
                key={genre.genre}
                accessibilityRole="button"
                accessibilityLabel={`Open ${genre.genre}`}
                onPress={() => onOpen(genre.genre)}
                style={{
                  width: tile,
                  height: tile,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: COLORS.surface,
                }}
              >
                {genre.artworkUrl !== null ? (
                  <Image
                    source={{ uri: genre.artworkUrl }}
                    contentFit="cover"
                    style={{ width: tile, height: tile }}
                  />
                ) : null}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 12,
                    backgroundColor: "rgba(0,0,0,0.45)",
                  }}
                >
                  <Text
                    className="font-app-semibold text-sm text-white"
                    numberOfLines={2}
                  >
                    {genre.genre}
                  </Text>
                </View>
              </Pressable>
            ))}
      </View>
    </View>
  );
};

export default SearchGenreTiles;
