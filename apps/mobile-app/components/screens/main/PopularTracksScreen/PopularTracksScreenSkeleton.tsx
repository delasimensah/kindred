import React from "react";
import { useWindowDimensions } from "react-native";

import PopularTrackRowSkeleton from "../../../catalog/PopularTrackRow/PopularTrackRowSkeleton";
import { VStack } from "../../../ui/Stack/Stack";

const TITLE_SCALES = [0.72, 0.46, 0.6, 0.38, 0.66, 0.52];

const PopularTracksScreenSkeleton: React.FC = () => {
  const { height } = useWindowDimensions();
  const rowCount = Math.min(12, Math.max(8, Math.ceil((height - 160) / 64)));

  return (
    <VStack spacing="none" paddingX="lg" className="flex-1 bg-page">
      {Array.from({ length: rowCount }, (_, index) => (
        <PopularTrackRowSkeleton
          key={index}
          titleScale={TITLE_SCALES[index % TITLE_SCALES.length]}
        />
      ))}
    </VStack>
  );
};

export default PopularTracksScreenSkeleton;
