import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable } from "react-native";

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

export const FEATURED_CARD_HEIGHT = 280;

interface FeaturedArtistCardProps {
  artist: DiscoverArtistCard;
  onToggleFollow: () => void;
  onOpen: () => void;
}

const FeaturedArtistCard: React.FC<FeaturedArtistCardProps> = ({
  artist,
  onToggleFollow,
  onOpen,
}) => {
  const followLabel = artist.isFollowed
    ? `Following ${artist.name}`
    : `Follow ${artist.name}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${artist.name}`}
      onPress={onOpen}
      className="overflow-hidden rounded-3xl bg-surface"
      style={{ height: FEATURED_CARD_HEIGHT, backgroundColor: COLORS.surface }}
    >
      {artist.coverUrl || artist.avatarUrl ? (
        <Image
          accessibilityLabel={artist.name}
          source={{ uri: artist.avatarUrl ?? artist.coverUrl ?? undefined }}
          contentFit="cover"
          contentPosition="top"
          transition={200}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.surface,
          }}
        />
      ) : (
        <VStack
          spacing="none"
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
      <VStack
        spacing="none"
        className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5"
      >
        <Text className="font-app-bold text-xs text-textOnPrimary">
          Featured
        </Text>
      </VStack>
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
                ? "flex-row items-center gap-1.5 rounded-full border border-text/25 bg-transparent px-5 py-2.5"
                : "flex-row items-center gap-1.5 rounded-full border border-primary bg-primary px-5 py-2.5"
            }
          >
            {artist.isFollowed ? (
              <Ionicons name="checkmark" size={14} color={COLORS.text} />
            ) : null}
            <Text
              className={
                artist.isFollowed
                  ? "font-app-semibold text-sm text-text"
                  : "font-app-semibold text-sm text-textOnPrimary"
              }
            >
              {artist.isFollowed ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </Pressable>
  );
};

export default FeaturedArtistCard;
