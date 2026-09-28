import { Stack } from "expo-router";

import { COLORS, FONTS } from "@/constants";
import { defaultStackScreenOptions } from "@/utils";

/**
 * Account is a modal over the tabs. The request form pushes on this stack
 * so the modal stays open and the system back button returns here.
 * https://docs.expo.dev/router/advanced/modals/
 * https://docs.expo.dev/router/advanced/stack/
 */
const AccountLayout = () => {
  return (
    <Stack
      screenOptions={{
        ...defaultStackScreenOptions,
        headerShown: true,
        headerShadowVisible: false,
        headerTintColor: COLORS.text,
        headerStyle: { backgroundColor: COLORS.page },
        headerTitleStyle: {
          color: COLORS.text,
          fontFamily: FONTS.medium,
        },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: COLORS.page },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Account" }} />
      <Stack.Screen name="request" options={{ title: "" }} />
    </Stack>
  );
};

export default AccountLayout;
