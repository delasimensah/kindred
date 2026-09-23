import { Stack } from "expo-router";

import { defaultStackScreenOptions } from "@/utils";

const SearchLayout = () => {
  return (
    <Stack
      screenOptions={{
        ...defaultStackScreenOptions,
        headerShown: true,
        title: "Search",
      }}
    />
  );
};

export default SearchLayout;
