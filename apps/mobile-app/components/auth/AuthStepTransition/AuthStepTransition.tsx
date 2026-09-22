import React, { useMemo } from "react";
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  useReducedMotion,
} from "react-native-reanimated";

import { VStack } from "../../ui/Stack/Stack";

interface AuthStepTransitionProps {
  stepKey: string;
  direction: "forward" | "back";
  children: React.ReactNode;
}

const STEP_IN_MS = 280;
const STEP_OUT_MS = 180;

const AuthStepTransition: React.FC<AuthStepTransitionProps> = ({
  stepKey,
  direction,
  children,
}) => {
  const reduceMotion = useReducedMotion();
  const entering = useMemo(() => {
    if (reduceMotion) {
      return undefined;
    }
    return direction === "forward"
      ? FadeInRight.duration(STEP_IN_MS)
      : FadeInLeft.duration(STEP_IN_MS);
  }, [direction, reduceMotion]);
  const exiting = useMemo(() => {
    if (reduceMotion) {
      return undefined;
    }
    return direction === "forward"
      ? FadeOutLeft.duration(STEP_OUT_MS)
      : FadeOutRight.duration(STEP_OUT_MS);
  }, [direction, reduceMotion]);

  return (
    <Animated.View>
      {/* Animated.View used: Reanimated entering/exiting requires it; do not change. */}
      <Animated.View key={stepKey} entering={entering} exiting={exiting}>
        <VStack spacing="lg" className="w-full">
          {children}
        </VStack>
      </Animated.View>
    </Animated.View>
  );
};

export default AuthStepTransition;
