import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";

import PopularTrackRowSkeleton from "../../../catalog/PopularTrackRow/PopularTrackRowSkeleton";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const TRACK_SCALES = [0.72, 0.46, 0.6];
const ALBUM_SCALES = [0.7, 0.55, 0.62];

/** Matches artist profile: hero, actions, popular rows, album strip, update, about. */
const ArtistProfileScreenSkeleton: React.FC = () => {
  const { width } = useWindowDimensions();
  const contentWidth = width - 48;

  return (
    <ScrollView
      className="flex-1 bg-page"
      contentContainerStyle={{ paddingBottom: 24 }}
      testID="artist-profile-skeleton"
    >
      <SkeletonCard width={width} height={340} radius={0} />
      <VStack spacing="lg" paddingX="lg" paddingY="lg">
        <HStack spacing="sm">
          <SkeletonCard
            width={(contentWidth - 12) / 2}
            height={44}
            radius={22}
          />
          <SkeletonCard
            width={(contentWidth - 12) / 2}
            height={44}
            radius={22}
          />
        </HStack>
        <HStack spacing="sm" align="center" justify="between">
          <SkeletonCard width={148} height={18} radius={6} />
          <SkeletonCard width={64} height={14} radius={4} />
        </HStack>
        <VStack spacing="none">
          {TRACK_SCALES.map((titleScale) => (
            <PopularTrackRowSkeleton key={titleScale} titleScale={titleScale} />
          ))}
        </VStack>
        <VStack spacing="sm">
          <HStack spacing="sm" align="center" justify="between">
            <SkeletonCard width={72} height={18} radius={6} />
            <SkeletonCard width={64} height={14} radius={4} />
          </HStack>
          <ScrollRow>
            {ALBUM_SCALES.map((titleScale) => (
              <VStack key={titleScale} spacing="xs" className="w-32">
                <SkeletonCard width={128} height={128} radius={12} />
                <SkeletonCard width={128 * titleScale} height={12} radius={4} />
                <SkeletonCard width={88} height={10} radius={4} />
              </VStack>
            ))}
          </ScrollRow>
        </VStack>
        <VStack spacing="sm">
          <SkeletonCard width={96} height={18} radius={6} />
          <SkeletonCard width={contentWidth} height={120} radius={16} />
        </VStack>
        <VStack spacing="sm">
          <SkeletonCard width={72} height={18} radius={6} />
          <SkeletonCard width={contentWidth} height={80} radius={16} />
        </VStack>
      </VStack>
    </ScrollView>
  );
};

const ScrollRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <HStack spacing="sm" className="overflow-hidden">
      {children}
    </HStack>
  );
};

export default ArtistProfileScreenSkeleton;
