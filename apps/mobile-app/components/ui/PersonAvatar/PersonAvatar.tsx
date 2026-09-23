import { Image } from "expo-image";
import React from "react";
import { getDisplayInitials } from "shared";

import { COLORS } from "@/constants";

import { VStack } from "../Stack/Stack";
import Text from "../Text/Text";

interface PersonAvatarProps {
  displayName: string;
  imageUrl?: string | null;
  size?: number;
}

const PersonAvatar: React.FC<PersonAvatarProps> = ({
  displayName,
  imageUrl,
  size = 32,
}) => {
  const fontSize = size <= 32 ? 11 : size <= 48 ? 14 : 20;

  if (imageUrl) {
    return (
      <Image
        accessibilityLabel={displayName}
        source={{ uri: imageUrl }}
        contentFit="cover"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: COLORS.surface,
        }}
      />
    );
  }

  return (
    <VStack
      spacing="none"
      align="center"
      justify="center"
      accessibilityLabel={displayName}
      className="rounded-full border border-surface bg-primary"
      style={{ width: size, height: size }}
    >
      <Text
        className="font-app-bold uppercase text-textOnPrimary"
        style={{
          color: COLORS.textOnPrimary,
          fontSize,
          lineHeight: fontSize + 2,
        }}
      >
        {getDisplayInitials(displayName)}
      </Text>
    </VStack>
  );
};

export default PersonAvatar;
