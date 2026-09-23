import { Stack } from "expo-router";

import { tabStackScreenOptions } from "@/utils";

const LibraryLayout = () => {
  return (
    <Stack screenOptions={tabStackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default LibraryLayout;
