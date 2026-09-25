import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { formatCountDisplay } from "shared";

import { COLORS } from "@/constants";

import { HStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface LiveListenerChipProps {
  count: number;
}

/**
 * Approximate live count only — never names (KIND-59).
 * Blur: https://docs.expo.dev/versions/latest/sdk/blur-view/
 */
const LiveListenerChip: React.FC<LiveListenerChipProps> = ({ count }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.35, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const label = `${formatCountDisplay(count)} listening now`;

  return (
    <BlurView
      accessibilityRole="text"
      accessibilityLabel={label}
      intensity={40}
      tint="dark"
      style={{
        alignSelf: "flex-start",
        overflow: "hidden",
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: "rgba(238, 238, 238, 0.1)",
        backgroundColor: "rgba(57, 62, 70, 0.9)",
      }}
    >
      <HStack
        spacing="xs"
        align="center"
        paddingX="sm"
        paddingY="xs"
        style={{ backgroundColor: "transparent" }}
      >
        <Animated.View style={dotStyle}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.primary,
            }}
          />
        </Animated.View>
        <Text className="font-app-medium text-[11px] text-text/80">
          {label}
        </Text>
      </HStack>
    </BlurView>
  );
};

export default LiveListenerChip;
