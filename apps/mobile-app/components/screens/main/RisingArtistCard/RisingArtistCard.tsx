import React from "react";
import { Pressable } from "react-native";

import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import type { DiscoverArtistCard } from "../FeaturedArtistCard/FeaturedArtistCard";

interface RisingArtistCardProps {
  artist: DiscoverArtistCard;
  onToggleFollow: () => void;
  onOpen: () => void;
}

function shortName(name: string): string {
  const first = name.trim().split(/\s+/)[0];
  return first || name;
}

const RisingArtistCard: React.FC<RisingArtistCardProps> = ({
  artist,
  onToggleFollow,
  onOpen,
}) => {
  const label = shortName(artist.name);
  const followLabel = artist.isFollowed
    ? `Following ${artist.name}`
    : `Follow ${artist.name}`;

  return (
    <VStack spacing="sm" align="center" className="w-[92px]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${artist.name}`}
        onPress={onOpen}
      >
        <VStack spacing="sm" align="center">
          <PersonAvatar
            displayName={artist.name}
            imageUrl={artist.avatarUrl}
            size={80}
          />
          <Text
            className="w-full text-center font-app-medium text-xs text-text"
            numberOfLines={1}
          >
            {label}
          </Text>
        </VStack>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={followLabel}
        onPress={onToggleFollow}
        className={
          artist.isFollowed
            ? "w-full items-center rounded-full border border-primary bg-primary px-3.5 py-1.5"
            : "w-full items-center rounded-full border border-text/25 bg-transparent px-3.5 py-1.5"
        }
      >
        <Text
          className={
            artist.isFollowed
              ? "font-app-semibold text-[11px] text-textOnPrimary"
              : "font-app-semibold text-[11px] text-text"
          }
        >
          {artist.isFollowed ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </VStack>
  );
};

export default RisingArtistCard;
