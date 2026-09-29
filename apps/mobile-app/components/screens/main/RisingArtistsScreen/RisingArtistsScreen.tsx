import React from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import type { DiscoverArtistCard } from "../FeaturedArtistCard/FeaturedArtistCard";

interface RisingArtistsScreenProps {
  artists: DiscoverArtistCard[];
  isLoading: boolean;
  onToggleFollow: (artistId: string) => void;
  onOpenArtist: (artistId: string) => void;
}

const SKELETON_ROWS = 8;
const NAME_SCALES = [0.62, 0.44, 0.72, 0.38, 0.56, 0.48, 0.66, 0.5];

const RisingArtistsScreen: React.FC<RisingArtistsScreenProps> = ({
  artists,
  isLoading,
  onToggleFollow,
  onOpenArtist,
}) => {
  const insets = useAppInsets();

  if (isLoading) {
    return <RisingArtistsSkeleton />;
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
        paddingTop: 16,
      }}
    >
      {artists.length === 0 ? (
        <CollectionEmptyState
          icon="people"
          title="No rising artists yet"
          subtitle="Artists on the rise show up here."
        />
      ) : (
        <VStack spacing="sm">
          {artists.map((artist) => (
            <RisingArtistRow
              key={artist.artistId}
              artist={artist}
              onOpen={() => onOpenArtist(artist.artistId)}
              onToggleFollow={() => onToggleFollow(artist.artistId)}
            />
          ))}
        </VStack>
      )}
    </ScrollView>
  );
};

function RisingArtistRow({
  artist,
  onOpen,
  onToggleFollow,
}: {
  artist: DiscoverArtistCard;
  onOpen: () => void;
  onToggleFollow: () => void;
}) {
  const followLabel = artist.isFollowed
    ? `Following ${artist.name}`
    : `Follow ${artist.name}`;

  return (
    <HStack spacing="sm" align="center" className="rounded-2xl bg-surface p-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${artist.name}`}
        onPress={onOpen}
        style={{ flex: 1, minWidth: 0 }}
      >
        <HStack spacing="sm" align="center">
          <PersonAvatar
            displayName={artist.name}
            imageUrl={artist.avatarUrl}
            size={56}
          />
          <Text
            className="min-w-0 flex-1 font-app-semibold text-[15px] text-text"
            numberOfLines={1}
          >
            {artist.name}
          </Text>
        </HStack>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={followLabel}
        onPress={onToggleFollow}
        className={
          artist.isFollowed
            ? "rounded-full bg-primary px-4 py-2"
            : "rounded-full border border-text/20 px-4 py-2"
        }
      >
        <Text
          className={
            artist.isFollowed
              ? "font-app-semibold text-xs text-textOnPrimary"
              : "font-app-semibold text-xs text-primary"
          }
        >
          {artist.isFollowed ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </HStack>
  );
}

function RisingArtistsSkeleton() {
  const { width } = useWindowDimensions();
  const nameWidth = Math.max(96, width - 48 - 24 - 56 - 88 - 24);

  return (
    <VStack
      spacing="sm"
      className="flex-1 bg-page px-6 pt-4"
      testID="rising-artists-skeleton"
    >
      {NAME_SCALES.slice(0, SKELETON_ROWS).map((scale) => (
        <HStack
          key={scale}
          spacing="sm"
          align="center"
          className="rounded-2xl bg-surface p-3"
        >
          <SkeletonCard width={56} height={56} radius={28} tone="page" />
          <SkeletonCard
            width={nameWidth * scale}
            height={15}
            radius={4}
            tone="page"
          />
          <SkeletonCard width={76} height={32} radius={16} tone="page" />
        </HStack>
      ))}
    </VStack>
  );
}

export default RisingArtistsScreen;
