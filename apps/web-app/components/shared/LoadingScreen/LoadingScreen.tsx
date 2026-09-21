import { Box } from "@mantine/core";
import React from "react";

import Heading from "../../ui/Heading/Heading";

const LoadingScreen: React.FC = () => {
  return (
    <Box className="bg-accent flex min-h-screen items-center justify-center">
      <Heading
        variant="page"
        className="mb-0 text-[32px] font-bold tracking-tight text-primary"
      >
        Kindred
      </Heading>
    </Box>
  );
};

export default LoadingScreen;
