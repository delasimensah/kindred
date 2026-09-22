import { Blur, Canvas, Circle, Group } from "@shopify/react-native-skia";
import React from "react";
import { useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";

import { VStack } from "../../ui/Stack/Stack";

interface AuthGlowBackgroundProps {
  variant: "welcome" | "sign-in" | "sign-up";
}

const AuthGlowBackground: React.FC<AuthGlowBackgroundProps> = ({ variant }) => {
  const { width, height } = useWindowDimensions();
  const strong =
    variant === "sign-up"
      ? { cx: 48, cy: 32, r: 128, opacity: 0.16 }
      : { cx: width - 48, cy: 32, r: 128, opacity: 0.18 };
  const soft =
    variant === "sign-up"
      ? { cx: width - 16, cy: height - 208, r: 112, opacity: 0.08 }
      : { cx: 16, cy: height / 3 + 112, r: 112, opacity: 0.1 };

  return (
    <VStack
      pointerEvents="none"
      className="absolute inset-0"
      style={{ width, height }}
    >
      <Canvas style={{ width, height }}>
        <Group>
          <Blur blur={64} mode="decal" />
          <Circle
            cx={strong.cx}
            cy={strong.cy}
            r={strong.r}
            color={COLORS.primary}
            opacity={strong.opacity}
          />
          <Circle
            cx={soft.cx}
            cy={soft.cy}
            r={soft.r}
            color={COLORS.primary}
            opacity={soft.opacity}
          />
        </Group>
      </Canvas>
    </VStack>
  );
};

export default AuthGlowBackground;
