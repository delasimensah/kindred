import { api } from "@convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { Stack, ThemeProvider } from "expo-router";
import { useEffect } from "react";

import { COLORS } from "@/constants";
import {
  defaultStackScreenOptions,
  navigationTheme,
  screenPresets,
} from "@/utils";

/**
 * Stack over the tab shell so Account presents as a modal that covers the
 * tab bar (Apple Music–style), opened from any tab that shows the avatar.
 * https://docs.expo.dev/router/advanced/modals/
 */
const MainAppLayout = () => {
  const me = useQuery(api.profiles.getMe, {});
  const sync = useAction(api.entitlements.sync);
  const profileId = me?.profileId ?? null;

  useEffect(() => {
    if (profileId === null) {
      return;
    }
    void sync().catch(() => undefined);
  }, [profileId, sync]);

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          ...defaultStackScreenOptions,
          ...screenPresets.noHeader,
          contentStyle: { backgroundColor: COLORS.page },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="account"
          options={{
            presentation: "modal",
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.page },
          }}
        />
        <Stack.Screen
          name="locked-track"
          options={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.page },
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: "transparentModal",
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
};

export default MainAppLayout;
