import { Stack } from "expo-router";

import { tabStackScreenOptions } from "@/utils";

const HomeLayout = () => {
  return (
    <Stack screenOptions={tabStackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default HomeLayout;
