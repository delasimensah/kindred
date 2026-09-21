import React from "react";

import { VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

const RoleWaitScreen: React.FC = () => {
  return (
    <VStack align="center" justify="center" className="bg-accent flex-1">
      <Text
        accessibilityRole="header"
        className="font-app-bold text-[32px] tracking-tight text-primary"
      >
        Kindred
      </Text>
    </VStack>
  );
};

export default RoleWaitScreen;
