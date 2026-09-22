import { Stack } from "expo-router";

import { defaultStackScreenOptions, screenPresets } from "@/utils";

const MainAppLayout = () => {
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

export default MainAppLayout;
