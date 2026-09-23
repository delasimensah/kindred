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
    </Stack>
  );
};

export default HomeLayout;
