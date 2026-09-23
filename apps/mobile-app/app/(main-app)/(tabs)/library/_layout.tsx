import { Stack } from "expo-router";

import {
  coverHeaderScreenOptions,
  routeParam,
  tabStackScreenOptions,
} from "@/utils";

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
        options={({ route }) => ({
          title:
            routeParam(
              (route.params as { name?: string | string[] } | undefined)?.name
            ) ?? "",
        })}
      />
    </Stack>
  );
};

export default LibraryLayout;
