import React from "react";
import { useWindowDimensions } from "react-native";

import PopularTrackRowSkeleton from "../../../catalog/PopularTrackRow/PopularTrackRowSkeleton";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const ArtistProfileScreenSkeleton: React.FC = () => {
  const { width } = useWindowDimensions();
  const contentWidth = width - 48;

  return (
    <VStack spacing="lg" className="flex-1 bg-page">
      <SkeletonCard width={width} height={280} radius={0} />
      <VStack spacing="lg" paddingX="lg">
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
        <SkeletonCard width={148} height={18} radius={6} />
        <VStack spacing="none">
          <PopularTrackRowSkeleton titleScale={0.72} />
          <PopularTrackRowSkeleton titleScale={0.46} />
          <PopularTrackRowSkeleton titleScale={0.6} />
        </VStack>
        <SkeletonCard width={96} height={18} radius={6} />
        <SkeletonCard width={contentWidth} height={80} radius={16} />
      </VStack>
    </VStack>
  );
};

export default ArtistProfileScreenSkeleton;
