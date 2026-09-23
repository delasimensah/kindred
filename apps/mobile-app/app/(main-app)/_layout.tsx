import { Stack, ThemeProvider } from "expo-router";

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
            headerShown: true,
            title: "Account",
            headerShadowVisible: false,
            headerTintColor: COLORS.text,
            headerStyle: { backgroundColor: COLORS.page },
            contentStyle: { backgroundColor: COLORS.page },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
};

export default MainAppLayout;
