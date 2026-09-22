import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { COLORS } from "@/constants";

import { HStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface FollowCounterPillProps {
  followCount: number;
  minimum: number;
}

const FollowCounterPill: React.FC<FollowCounterPillProps> = ({
  followCount,
  minimum,
}) => {
  const met = followCount >= minimum;

  return (
    <HStack
      spacing="sm"
      align="center"
      className={
        met
          ? "rounded-full bg-primary px-3 py-1.5"
          : "rounded-full bg-surface px-3 py-1.5"
      }
    >
      <Ionicons
        name="checkmark"
        size={10}
        color={met ? COLORS.textOnPrimary : COLORS.text}
        style={{ opacity: met ? 1 : 0.4 }}
      />
      <Text
        className={
          met
            ? "font-app-semibold text-xs text-textOnPrimary"
            : "font-app-semibold text-xs text-text/60"
        }
      >
        {followCount} of {minimum} minimum
      </Text>
    </HStack>
  );
};

export default FollowCounterPill;
