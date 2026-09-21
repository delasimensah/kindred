import { Box } from "@mantine/core";

const MainAppLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box className="min-h-screen bg-page">{children}</Box>;
};

export default MainAppLayout;
