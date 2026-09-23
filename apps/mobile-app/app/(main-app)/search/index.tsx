import { Stack } from "expo-router";

import { TabRootScreen } from "@/components";
import { COLORS } from "@/constants";

const SearchRoute = () => {
  return (
    <>
      <TabRootScreen title="Search" body="Find artists and tracks." />
      <Stack.SearchBar
        placeholder="Artists, tracks"
        placement="automatic"
        tintColor={COLORS.primary}
        hideWhenScrolling={false}
      />
    </>
  );
};

export default SearchRoute;
