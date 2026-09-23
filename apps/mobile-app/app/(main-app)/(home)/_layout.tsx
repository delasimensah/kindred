import { Stack } from "expo-router";

import { defaultStackScreenOptions, screenPresets } from "@/utils";

const HomeLayout = () => {
  return (
    <Stack
      screenOptions={{
        ...defaultStackScreenOptions,
        ...screenPresets.noHeader,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="account" />
    </Stack>
  );
};

export default HomeLayout;
