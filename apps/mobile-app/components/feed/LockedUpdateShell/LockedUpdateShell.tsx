import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface LockedUpdateShellProps {
  artistName: string;
  noun?: "post" | "track";
  onSupport: () => void;
}

const LockedUpdateShell: React.FC<LockedUpdateShellProps> = ({
  artistName,
  noun = "post",
  onSupport,
}) => {
  return (
    <VStack
      spacing="sm"
      align="center"
      className="rounded-xl bg-page px-5 py-5"
    >
      <VStack
        spacing="none"
        align="center"
        justify="center"
        className="h-11 w-11 rounded-full bg-primary/10"
      >
        <Ionicons name="lock-closed" size={16} color={COLORS.primary} />
      </VStack>
      <Text className="text-center text-xs text-text/50">
        {`This ${noun} is exclusive to ${artistName}'s supporters`}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Support ${artistName} to unlock`}
        onPress={onSupport}
      >
        <HStack
          spacing="none"
          align="center"
          justify="center"
          className="rounded-full bg-primary px-5 py-2.5"
        >
          <Text className="font-app-semibold text-xs text-textOnPrimary">
            Support to unlock
          </Text>
        </HStack>
      </Pressable>
    </VStack>
  );
};

export default LockedUpdateShell;
