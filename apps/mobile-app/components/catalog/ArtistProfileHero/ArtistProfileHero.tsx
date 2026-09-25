import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

import { COLORS } from "@/constants";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import LiveListenerChip from "../LiveListenerChip/LiveListenerChip";

interface ArtistProfileHeroProps {
  name: string;
  imageUrl: string | null;
  liveListenerCount: number;
}

const ArtistProfileHero: React.FC<ArtistProfileHeroProps> = ({
  name,
  imageUrl,
  liveListenerCount,
}) => {
  return (
    <VStack
      spacing="none"
      className="w-full overflow-hidden bg-surface"
      style={{ height: 340, backgroundColor: COLORS.surface }}
    >
      {imageUrl ? (
        <Image
          accessibilityLabel={name}
          source={{ uri: imageUrl }}
          contentFit="cover"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.surface,
          }}
        />
      ) : (
        <VStack spacing="none" className="absolute inset-0 bg-surface" />
      )}
      <LinearGradient
        colors={["transparent", COLORS.page]}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <VStack
        spacing="sm"
        paddingX="lg"
        style={{ position: "absolute", left: 0, right: 0, bottom: 20 }}
      >
        <LiveListenerChip count={liveListenerCount} />
        <Text className="font-display-bold text-3xl text-text">{name}</Text>
      </VStack>
    </VStack>
  );
};

export default ArtistProfileHero;
