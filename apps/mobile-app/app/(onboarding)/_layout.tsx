import { Stack, useSegments } from "expo-router";

import AuthScreenShell from "@/components/auth/AuthScreenShell/AuthScreenShell";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress/OnboardingProgress";
import { VStack } from "@/components/ui/Stack/Stack";
import { useAppInsets } from "@/hooks";
import { defaultStackScreenOptions, screenPresets } from "@/utils";

export const unstable_settings = {
  initialRouteName: "index",
};

const OnboardingLayout = () => {
  const insets = useAppInsets();
  const segments = useSegments();
  const route = segments[segments.length - 1];
  const step = route === "follow-artists" ? 2 : 1;

  return (
    <AuthScreenShell glow="onboarding">
      <VStack spacing="none" className="flex-1">
        <Stack
          unstable_nativeProps={{
            nativeContainerStyle: { backgroundColor: "transparent" },
          }}
          screenOptions={{
            ...defaultStackScreenOptions,
            ...screenPresets.noHeader,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: "transparent", flex: 1 },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="genres" />
          <Stack.Screen name="follow-artists" />
        </Stack>
        <VStack
          pointerEvents="box-none"
          paddingX="lg"
          spacing="none"
          className="absolute left-0 right-0 top-0"
          style={{ paddingTop: insets.top + 16, paddingBottom: 16 }}
        >
          <OnboardingProgress step={step} />
        </VStack>
      </VStack>
    </AuthScreenShell>
  );
};

export default OnboardingLayout;
