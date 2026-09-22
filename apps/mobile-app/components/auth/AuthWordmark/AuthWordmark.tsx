import { Image } from "expo-image";
import React from "react";

import { ASSETS } from "@/constants";

import { VStack } from "../../ui/Stack/Stack";

interface AuthWordmarkProps {
  size?: "md" | "lg";
}

const AuthWordmark: React.FC<AuthWordmarkProps> = ({ size = "md" }) => {
  const isLarge = size === "lg";

  return (
    <VStack
      spacing="none"
      align="center"
      justify="center"
      className={
        isLarge
          ? "h-24 w-24 self-center overflow-hidden rounded-3xl border border-primary/20 bg-surface"
          : "h-14 w-14 self-center overflow-hidden rounded-2xl border border-primary/20 bg-surface"
      }
    >
      <Image
        accessibilityLabel="Kindred mark"
        source={ASSETS.icons.logo}
        className={isLarge ? "h-16 w-16" : "h-10 w-10"}
        contentFit="contain"
      />
    </VStack>
  );
};

export default AuthWordmark;
