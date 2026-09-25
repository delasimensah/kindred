import { Box } from "@mantine/core";
import React from "react";

import { ASSETS } from "@/constants";

const LoadingScreen: React.FC = () => {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-page">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.icons.logo}
        alt="Kindred"
        width={112}
        height={112}
        className="h-28 w-28 rounded-2xl"
        decoding="async"
      />
    </Box>
  );
};

export default LoadingScreen;
