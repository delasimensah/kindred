import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

import { COLORS } from "@/constants";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import LiveListenerChip from "../LiveListenerChip/LiveListenerChip";

interface ArtistProfileHeroProps {
  name: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  followerCount: number;
  supporterCount: number;
  liveListenerCount: number;
}

function countLabel(count: number, one: string, many: string) {
  return `${count.toLocaleString()} ${count === 1 ? one : many}`;
}

const ArtistProfileHero: React.FC<ArtistProfileHeroProps> = ({
  name,
  avatarUrl,
  coverUrl,
  followerCount,
  supporterCount,
  liveListenerCount,
}) => {
  const imageUrl = avatarUrl ?? coverUrl;

  return (
    <VStack
      spacing="none"
      className="w-full overflow-hidden bg-surface"
      style={{ height: 420, backgroundColor: COLORS.surface }}
    >
      {imageUrl ? (
        <Image
          accessibilityLabel={name}
          source={{ uri: imageUrl }}
          contentFit="cover"
          contentPosition="top"
          transition={200}
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
        colors={["transparent", "transparent", COLORS.page]}
        locations={[0, 0.45, 1]}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <VStack
        spacing="xs"
        paddingX="lg"
        style={{ position: "absolute", left: 0, right: 0, bottom: 16 }}
      >
        <LiveListenerChip count={liveListenerCount} />
        <Text className="font-display-bold text-4xl text-text">{name}</Text>
        <Text className="font-app-medium text-sm text-text/70">
          {countLabel(followerCount, "follower", "followers")} ·{" "}
          {countLabel(supporterCount, "supporter", "supporters")}
        </Text>
      </VStack>
    </VStack>
  );
};

export default ArtistProfileHero;
