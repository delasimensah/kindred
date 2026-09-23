import { Stack } from "expo-router";

import { LibraryMessageScreen } from "@/components";

const DownloadsRoute = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Downloaded" }} />
      <LibraryMessageScreen
        icon="download"
        title="No downloads yet"
        subtitle="Saving a track to listen offline is not available on this screen."
      />
    </>
  );
};

export default DownloadsRoute;
