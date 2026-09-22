import { type Href, useRouter } from "expo-router";
import React, { useMemo } from "react";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import AuthScreenShell from "../../../auth/AuthScreenShell/AuthScreenShell";
import AuthWelcomeHero from "../../../auth/AuthWelcomeHero/AuthWelcomeHero";
import Button from "../../../ui/Button/Button";
import { VStack } from "../../../ui/Stack/Stack";

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const insets = useAppInsets();
  const reduceMotion = useReducedMotion();
  const buttonsEntering = useMemo(
    () => (reduceMotion ? undefined : FadeInDown.duration(500).delay(280)),
    [reduceMotion]
  );

  return (
    <AuthScreenShell glow="welcome">
      <VStack
        className="flex-1"
        paddingX="lg"
        style={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <VStack className="flex-1" align="center" justify="center">
          <AuthWelcomeHero />
        </VStack>
        {/* Animated.View used: Reanimated entering requires it; do not change. */}
        <Animated.View entering={buttonsEntering}>
          <VStack spacing="sm" className="w-full">
            <Button
              text="Create account"
              size="lg"
              fullWidth
              className="rounded-full"
              textClassName="text-lg font-app-semibold"
              style={{
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
              onPress={() => {
                router.push("/(auth)/sign-up" as Href);
              }}
            />
            <Button
              text="Sign in"
              variant="outline"
              size="lg"
              fullWidth
              className="rounded-full"
              textClassName="text-lg font-app-semibold"
              onPress={() => {
                router.push("/(auth)/sign-in" as Href);
              }}
            />
          </VStack>
        </Animated.View>
      </VStack>
    </AuthScreenShell>
  );
};

export default WelcomeScreen;
