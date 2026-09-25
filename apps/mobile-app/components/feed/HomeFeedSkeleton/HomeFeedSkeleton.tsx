import React from "react";
import { useWindowDimensions } from "react-native";

import SkeletonCard from "../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../ui/Stack/Stack";

const AuthorSkeleton: React.FC<{ textWidth: number }> = ({ textWidth }) => {
  return (
    <HStack spacing="sm" align="center">
      <SkeletonCard width={40} height={40} radius={20} tone="page" />
      <VStack spacing="xs" className="min-w-0 flex-1">
        <SkeletonCard
          width={textWidth * 0.42}
          height={12}
          radius={4}
          tone="page"
        />
        <SkeletonCard
          width={textWidth * 0.28}
          height={10}
          radius={4}
          tone="page"
        />
      </VStack>
    </HStack>
  );
};

/**
 * Three update shapes from the home loading design: a track row, a photo,
 * and a voice note. The rising-chip row in that file is not on this screen.
 */
const HomeFeedSkeleton: React.FC = () => {
  const { width } = useWindowDimensions();
  const inner = Math.max(120, width - 48 - 32);

  return (
    <VStack spacing="md" testID="home-feed-skeleton">
      <VStack spacing="sm" padding="md" className="rounded-2xl bg-surface">
        <AuthorSkeleton textWidth={inner} />
        <HStack
          spacing="sm"
          align="center"
          className="rounded-xl bg-page p-2.5"
        >
          <SkeletonCard width={48} height={48} radius={8} />
          <VStack spacing="xs" className="min-w-0 flex-1">
            <SkeletonCard width={inner * 0.46} height={12} radius={4} />
            <SkeletonCard width={inner * 0.18} height={10} radius={4} />
          </VStack>
          <SkeletonCard width={40} height={40} radius={20} />
        </HStack>
      </VStack>
      <VStack spacing="sm" padding="md" className="rounded-2xl bg-surface">
        <AuthorSkeleton textWidth={inner} />
        <SkeletonCard width={inner * 0.8} height={12} radius={4} tone="page" />
        <SkeletonCard width={inner} height={168} radius={12} tone="page" />
      </VStack>
      <VStack spacing="sm" padding="md" className="rounded-2xl bg-surface">
        <AuthorSkeleton textWidth={inner} />
        <SkeletonCard width={inner * 0.88} height={12} radius={4} tone="page" />
        <HStack
          spacing="sm"
          align="center"
          className="self-start rounded-full bg-page py-2 pl-2 pr-4"
        >
          <SkeletonCard width={32} height={32} radius={16} />
          <SkeletonCard width={120} height={22} radius={6} />
        </HStack>
      </VStack>
    </VStack>
  );
};

export default HomeFeedSkeleton;
