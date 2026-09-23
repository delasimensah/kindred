import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface TrackSupportGateProps {
  artistName: string;
  onSupport: () => void;
}

const TrackSupportGate: React.FC<TrackSupportGateProps> = ({
  artistName,
  onSupport,
}) => {
  return (
    <VStack
      spacing="md"
      align="center"
      padding="lg"
      className="rounded-3xl bg-surface"
    >
      <HStack
        spacing="none"
        align="center"
        justify="center"
        className="h-14 w-14 rounded-full bg-page"
      >
        <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
      </HStack>
      <VStack spacing="sm" align="center">
        <Text className="font-app-semibold text-base text-text">
          This is for supporters
        </Text>
        <Text className="text-center text-sm text-text/50">
          {artistName} shares this track with supporters only.
        </Text>
      </VStack>
      <VStack spacing="sm" className="w-full">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Support ${artistName}`}
          onPress={onSupport}
        >
          <HStack
            spacing="none"
            align="center"
            justify="center"
            className="rounded-full bg-primary py-3.5"
          >
            <Text className="font-app-semibold text-sm text-textOnPrimary">
              Support {artistName}
            </Text>
          </HStack>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See plans"
          onPress={onSupport}
        >
          <HStack
            spacing="none"
            align="center"
            justify="center"
            className="rounded-full border border-text/20 py-3.5"
          >
            <Text className="font-app-semibold text-sm text-text">
              See plans
            </Text>
          </HStack>
        </Pressable>
      </VStack>
    </VStack>
  );
};

export default TrackSupportGate;
