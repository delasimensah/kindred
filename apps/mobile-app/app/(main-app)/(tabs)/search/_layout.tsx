import { Stack } from "expo-router";

import { coverHeaderScreenOptions, tabStackScreenOptions } from "@/utils";

const SearchLayout = () => {
  return (
    <Stack screenOptions={tabStackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="artist/[artistId]"
        options={coverHeaderScreenOptions}
      />
    </Stack>
  );
};

export default SearchLayout;
