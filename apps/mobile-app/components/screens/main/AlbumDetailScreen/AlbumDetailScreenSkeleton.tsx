import React from "react";
import { useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";

import PopularTrackRowSkeleton from "../../../catalog/PopularTrackRow/PopularTrackRowSkeleton";
import { COLLECTION_HERO_HEIGHT } from "../../../library/LibraryCollectionHeader/LibraryCollectionHeader";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const TITLE_SCALES = [0.72, 0.5, 0.64, 0.42, 0.58, 0.48];

/** Matches album detail: full-bleed cover hero + popular-track rows. */
const AlbumDetailScreenSkeleton: React.FC = () => {
  const { width } = useWindowDimensions();

  return (
    <VStack
      spacing="none"
      className="flex-1 bg-page"
      testID="album-detail-skeleton"
    >
      <View
        style={{
          width,
          height: COLLECTION_HERO_HEIGHT,
          backgroundColor: COLORS.surface,
        }}
      >
        <HStack
          align="end"
          justify="between"
          className="absolute bottom-5 left-0 right-0 px-6"
        >
          <VStack spacing="xs" className="min-w-0 flex-1 pr-4">
            <SkeletonCard
              width={Math.min(220, width - 120)}
              height={28}
              radius={6}
            />
            <SkeletonCard
              width={Math.min(148, width - 120)}
              height={12}
              radius={4}
            />
          </VStack>
          <SkeletonCard width={56} height={56} radius={28} />
        </HStack>
      </View>
      <VStack spacing="none" paddingX="lg" paddingY="md">
        {TITLE_SCALES.map((titleScale) => (
          <PopularTrackRowSkeleton key={titleScale} titleScale={titleScale} />
        ))}
      </VStack>
    </VStack>
  );
};

export default AlbumDetailScreenSkeleton;
