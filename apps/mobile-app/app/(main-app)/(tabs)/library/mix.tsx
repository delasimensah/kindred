import { Stack } from "expo-router";

import { LibraryMessageScreen } from "@/components";

const MixRoute = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Make a mix" }} />
      <LibraryMessageScreen
        icon="shuffle"
        title="No mix yet"
        subtitle="Making a mix is not available on this screen."
      />
    </>
  );
};

export default MixRoute;
