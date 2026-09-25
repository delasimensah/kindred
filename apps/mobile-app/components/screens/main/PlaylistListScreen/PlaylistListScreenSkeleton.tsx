import React from "react";
import { useWindowDimensions } from "react-native";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const COVER = 64;
const GAP = 2;
const TILE = (COVER - GAP) / 2;

const ROW_SCALES = [
  { title: 0.58, meta: 0.36 },
  { title: 0.72, meta: 0.22 },
  { title: 0.48, meta: 0.4 },
  { title: 0.64, meta: 0.28 },
] as const;

/**
 * Matches the playlists list: create CTA, count line, and surface rows
 * with a four-tile cover like PlaylistCover — not blank blocks or an
 * empty-state silhouette.
 */
const PlaylistListScreenSkeleton: React.FC = () => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(0, width - 48);
  const textWidth = Math.max(80, contentWidth - 24 - COVER - 16 - 16);

  return (
    <VStack spacing="md" testID="playlist-list-skeleton">
      <SkeletonCard width={contentWidth} height={48} radius={24} />
      <SkeletonCard width={88} height={10} radius={4} />
      {ROW_SCALES.map((scale, index) => (
        <HStack
          key={index}
          spacing="md"
          align="center"
          className="rounded-2xl bg-surface p-3"
        >
          <CoverMosaicSkeleton />
          <VStack spacing="xs" className="min-w-0 flex-1">
            <SkeletonCard
              width={textWidth * scale.title}
              height={14}
              radius={4}
              tone="page"
            />
            <SkeletonCard
              width={textWidth * scale.meta}
              height={10}
              radius={4}
              tone="page"
            />
          </VStack>
          <SkeletonCard width={10} height={14} radius={3} tone="page" />
        </HStack>
      ))}
    </VStack>
  );
};

const CoverMosaicSkeleton: React.FC = () => {
  return (
    <VStack
      spacing="none"
      className="overflow-hidden rounded-xl"
      style={{ width: COVER, height: COVER, gap: GAP }}
    >
      <HStack spacing="none" style={{ gap: GAP }}>
        <SkeletonCard width={TILE} height={TILE} radius={0} tone="page" />
        <SkeletonCard width={TILE} height={TILE} radius={0} tone="page" />
      </HStack>
      <HStack spacing="none" style={{ gap: GAP }}>
        <SkeletonCard width={TILE} height={TILE} radius={0} tone="page" />
        <SkeletonCard width={TILE} height={TILE} radius={0} tone="page" />
      </HStack>
    </VStack>
  );
};

export default PlaylistListScreenSkeleton;
