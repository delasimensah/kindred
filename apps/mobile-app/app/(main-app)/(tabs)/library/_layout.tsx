import { Stack } from "expo-router";

import { coverHeaderScreenOptions, tabStackScreenOptions } from "@/utils";

const LibraryLayout = () => {
  return (
    <Stack screenOptions={tabStackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="artist/[artistId]"
        options={coverHeaderScreenOptions}
      />
      <Stack.Screen
        name="playlist/[playlistId]/index"
        options={coverHeaderScreenOptions}
      />
      <Stack.Screen name="liked" options={coverHeaderScreenOptions} />
    </Stack>
  );
};

export default LibraryLayout;
