import React, { useMemo } from "react";
import Animated, {
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import AuthWordmark from "../AuthWordmark/AuthWordmark";

const AuthWelcomeHero: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const markEntering = useMemo(
    () => (reduceMotion ? undefined : FadeIn.duration(560)),
    [reduceMotion]
  );
  const copyEntering = useMemo(
    () => (reduceMotion ? undefined : FadeInDown.duration(480).delay(140)),
    [reduceMotion]
  );

  return (
    <VStack spacing="lg" align="center">
      {/* Animated.View used: Reanimated entering requires it; do not change. */}
      <Animated.View entering={markEntering}>
        <AuthWordmark size="lg" />
      </Animated.View>
      <Animated.View entering={copyEntering}>
        <VStack spacing="sm" align="center">
          <Text className="text-center font-app-semibold text-3xl text-text">
            Find your sound.
          </Text>
          <Text className="text-center text-base text-text/50">
            Back rising African artists.
          </Text>
        </VStack>
      </Animated.View>
    </VStack>
  );
};

export default AuthWelcomeHero;
