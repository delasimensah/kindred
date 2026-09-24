import React from "react";
import { useWindowDimensions } from "react-native";

import SkeletonCard from "../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../ui/Stack/Stack";

interface PopularTrackRowSkeletonProps {
  titleScale?: number;
}

/** Cover, title, length, and the track menu. Matches a popular-track row. */
const PopularTrackRowSkeleton: React.FC<PopularTrackRowSkeletonProps> = ({
  titleScale = 0.62,
}) => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(0, width - 48);
  const textWidth = Math.max(80, contentWidth - 48 - 44 - 16);

  return (
    <HStack spacing="sm" align="center" paddingY="sm">
      <SkeletonCard width={48} height={48} radius={6} />
      <VStack spacing="xs" className="min-w-0 flex-1">
        <SkeletonCard width={textWidth * titleScale} height={12} radius={4} />
        <SkeletonCard width={textWidth * 0.28} height={10} radius={4} />
      </VStack>
      <SkeletonCard width={20} height={6} radius={3} />
    </HStack>
  );
};

export default PopularTrackRowSkeleton;
