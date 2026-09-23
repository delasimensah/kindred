import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, View } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export interface DiscoverArtistCard {
  artistId: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  isFollowed: boolean;
}

interface FeaturedArtistCardProps {
  artist: DiscoverArtistCard;
  onToggleFollow: () => void;
}

const FeaturedArtistCard: React.FC<FeaturedArtistCardProps> = ({
  artist,
  onToggleFollow,
}) => {
  const followLabel = artist.isFollowed
    ? `Following ${artist.name}`
    : `Follow ${artist.name}`;

  return (
    <View className="overflow-hidden rounded-3xl" style={{ height: 420 }}>
      {artist.coverUrl || artist.avatarUrl ? (
        <Image
          accessibilityLabel={artist.name}
          source={{ uri: artist.coverUrl ?? artist.avatarUrl ?? undefined }}
          contentFit="cover"
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />
      ) : (
        <View
          className="absolute inset-0 bg-surface"
          accessibilityLabel={artist.name}
        />
      )}
      <LinearGradient
        colors={["transparent", "rgba(34,40,49,0.35)", COLORS.page]}
        locations={[0.2, 0.55, 1]}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
      <View className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5">
        <Text className="font-app-bold text-[10px] uppercase tracking-wide text-textOnPrimary">
          Featured
        </Text>
      </View>
      <VStack spacing="sm" className="absolute bottom-0 left-0 right-0 p-5">
        <VStack spacing="none">
          <Text className="font-display-bold text-2xl text-text">
            {artist.name}
          </Text>
          <Text className="mt-1 text-sm text-text/60" numberOfLines={1}>
            {artist.bio}
          </Text>
        </VStack>
        <HStack spacing="sm" align="center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={followLabel}
            onPress={onToggleFollow}
            className={
              artist.isFollowed
                ? "rounded-full border border-primary bg-primary px-6 py-3"
                : "rounded-full border border-text/25 bg-transparent px-6 py-3"
            }
          >
            <Text
              className={
                artist.isFollowed
                  ? "font-app-semibold text-sm text-textOnPrimary"
                  : "font-app-semibold text-sm text-text"
              }
            >
              {artist.isFollowed ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </View>
  );
};

export default FeaturedArtistCard;
