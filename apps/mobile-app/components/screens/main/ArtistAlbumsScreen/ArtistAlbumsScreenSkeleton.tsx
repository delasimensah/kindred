import React from "react";
import { useWindowDimensions } from "react-native";

import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";

const GAP = 12;
const PAGE_PAD = 24;
const TITLE_SCALES = [0.72, 0.55, 0.68, 0.48, 0.62, 0.58, 0.7, 0.52];

/** Matches the albums grid: two cover tiles per row with title + meta lines. */
const ArtistAlbumsScreenSkeleton: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const tileWidth = Math.floor((width - PAGE_PAD * 2 - GAP) / 2);
  const rowHeight = tileWidth + 44;
  const rowCount = Math.min(
    6,
    Math.max(4, Math.ceil((height - 160) / rowHeight))
  );

  return (
    <VStack
      spacing="md"
      paddingX="lg"
      paddingY="md"
      className="flex-1 bg-page"
      testID="artist-albums-skeleton"
    >
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <HStack key={rowIndex} spacing="none" style={{ gap: GAP }}>
          {[0, 1].map((col) => {
            const scale =
              TITLE_SCALES[(rowIndex * 2 + col) % TITLE_SCALES.length] ?? 0.6;
            return (
              <VStack key={col} spacing="xs" style={{ width: tileWidth }}>
                <SkeletonCard
                  width={tileWidth}
                  height={tileWidth}
                  radius={12}
                />
                <SkeletonCard
                  width={tileWidth * scale}
                  height={12}
                  radius={4}
                />
                <SkeletonCard width={tileWidth * 0.55} height={10} radius={4} />
              </VStack>
            );
          })}
        </HStack>
      ))}
    </VStack>
  );
};

export default ArtistAlbumsScreenSkeleton;
