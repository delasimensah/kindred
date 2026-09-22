import { Stack } from "expo-router";

import { defaultStackScreenOptions, screenPresets } from "@/utils";

export const unstable_settings = {
  initialRouteName: "index",
};

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        ...defaultStackScreenOptions,
        ...screenPresets.noHeader,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
};

export default AuthLayout;
