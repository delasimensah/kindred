import React from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";
import { RISING_PREVIEW } from "@/utils";

import AccountAvatarButton from "../../../ui/AccountAvatarButton/AccountAvatarButton";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import FeaturedArtistCard, {
  type DiscoverArtistCard,
} from "../FeaturedArtistCard/FeaturedArtistCard";
import RisingArtistCard from "../RisingArtistCard/RisingArtistCard";

const PAGE_PADDING = 24;

interface DiscoverScreenProps {
  displayName: string;
  avatarUrl?: string | null;
  featured: DiscoverArtistCard[];
  rising: DiscoverArtistCard[];
  isLoading: boolean;
  onToggleFollow: (artistId: string) => void;
  onOpenArtist: (artistId: string) => void;
  onViewAllRising: () => void;
  onOpenAccount: () => void;
}

/**
 * ScrollView is the screen root so iOS 26 can minimize the tab bar and split
 * the mini-player on scroll. A fixed header around the list breaks that.
 * https://docs.expo.dev/versions/latest/sdk/router/native-tabs/
 */
const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  displayName,
  avatarUrl = null,
  featured,
  rising,
  isLoading,
  onToggleFollow,
  onOpenArtist,
  onViewAllRising,
  onOpenAccount,
}) => {
  const { height } = useWindowDimensions();
  const paddingTop = useTabScrollTopPad();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop,
        paddingBottom: 32,
        paddingHorizontal: PAGE_PADDING,
        minHeight: height + 120,
      }}
    >
      <HStack spacing="md" align="center" justify="between" className="pb-2">
        <Text className="font-display-bold text-3xl text-text">Discover</Text>
        <AccountAvatarButton
          displayName={displayName}
          imageUrl={avatarUrl}
          onPress={onOpenAccount}
        />
      </HStack>

      <VStack spacing="lg" className="pt-4">
        {isLoading ? <DiscoverSkeleton /> : null}

        {!isLoading && featured.length === 0 && rising.length === 0 ? (
          <CollectionEmptyState
            icon="compass"
            title="No artists yet"
            subtitle="Featured and rising artists show up here."
          />
        ) : null}

        {featured.map((artist) => (
          <FeaturedArtistCard
            key={artist.artistId}
            artist={artist}
            onToggleFollow={() => onToggleFollow(artist.artistId)}
            onOpen={() => onOpenArtist(artist.artistId)}
          />
        ))}

        {rising.length > 0 ? (
          <VStack spacing="sm">
            <HStack spacing="sm" align="center" justify="between">
              <Text className="font-app-semibold text-lg text-text">
                Rising artists
              </Text>
              {rising.length > RISING_PREVIEW ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all rising artists"
                  onPress={onViewAllRising}
                >
                  <Text className="font-app-semibold text-sm text-primary">
                    View all
                  </Text>
                </Pressable>
              ) : null}
            </HStack>
            <View style={{ marginHorizontal: -PAGE_PADDING }}>
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: PAGE_PADDING,
                  paddingBottom: 4,
                  gap: 16,
                }}
              >
                {rising.slice(0, RISING_PREVIEW).map((artist) => (
                  <RisingArtistCard
                    key={artist.artistId}
                    artist={artist}
                    onToggleFollow={() => onToggleFollow(artist.artistId)}
                    onOpen={() => onOpenArtist(artist.artistId)}
                  />
                ))}
              </ScrollView>
            </View>
          </VStack>
        ) : null}
      </VStack>
    </ScrollView>
  );
};

function DiscoverSkeleton() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(0, width - PAGE_PADDING * 2);

  return (
    <VStack spacing="lg" testID="discover-skeleton">
      <VStack
        spacing="none"
        justify="between"
        className="overflow-hidden rounded-3xl bg-surface p-5"
        style={{ height: 420 }}
      >
        <SkeletonCard width={72} height={22} radius={11} />
        <VStack spacing="sm">
          <SkeletonCard width={cardWidth * 0.46} height={28} radius={6} />
          <SkeletonCard width={cardWidth * 0.62} height={12} radius={4} />
          <SkeletonCard width={108} height={40} radius={20} />
        </VStack>
      </VStack>
      <VStack spacing="sm">
        <HStack spacing="sm" align="center" justify="between">
          <SkeletonCard width={132} height={18} radius={6} />
          <SkeletonCard width={56} height={14} radius={4} />
        </HStack>
        <HStack spacing="md">
          {[0.7, 0.5, 0.62, 0.4].map((scale) => (
            <VStack
              key={scale}
              spacing="sm"
              align="center"
              className="w-[92px]"
            >
              <SkeletonCard width={80} height={80} radius={40} />
              <SkeletonCard width={72 * scale} height={10} radius={4} />
              <SkeletonCard width={72} height={28} radius={14} />
            </VStack>
          ))}
        </HStack>
      </VStack>
    </VStack>
  );
}

export default DiscoverScreen;
