import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

import { HStack } from "../../ui/Stack/Stack";

interface AuthBackButtonProps {
  onPress: () => void;
}

const AuthBackButton: React.FC<AuthBackButtonProps> = ({ onPress }) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      onPress={onPress}
    >
      <HStack
        spacing="none"
        align="center"
        justify="center"
        className="h-11 w-11"
      >
        <Ionicons name="chevron-back" size={28} color={COLORS.text} />
      </HStack>
    </Pressable>
  );
};

export default AuthBackButton;
