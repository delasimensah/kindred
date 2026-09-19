import { Box } from "@mantine/core";
import React from "react";

const MainAppLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box className="min-h-screen bg-black">{children}</Box>;
};

export default MainAppLayout;
