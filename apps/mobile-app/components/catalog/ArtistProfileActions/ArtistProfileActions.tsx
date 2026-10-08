import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

import { HStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface ArtistProfileActionsProps {
  name: string;
  isFollowed: boolean;
  isSupporting: boolean;
  onToggleFollow: () => void;
  onSupport: () => void;
}

const ArtistProfileActions: React.FC<ArtistProfileActionsProps> = ({
  name,
  isFollowed,
  isSupporting,
  onToggleFollow,
  onSupport,
}) => {
  const followLabel = isFollowed ? `Following ${name}` : `Follow ${name}`;
  const supportLabel = isSupporting ? `Supporting ${name}` : `Support ${name}`;

  return (
    <HStack spacing="sm" align="center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={supportLabel}
        onPress={onSupport}
        className="flex-1"
      >
        <HStack
          spacing="xs"
          align="center"
          justify="center"
          className={
            isSupporting
              ? "rounded-full border border-primary/60 py-3"
              : "rounded-full bg-primary py-3"
          }
        >
          <Ionicons
            name={isSupporting ? "checkmark" : "heart"}
            size={15}
            color={isSupporting ? COLORS.primary : COLORS.textOnPrimary}
          />
          <Text
            className={
              isSupporting
                ? "font-app-semibold text-sm text-primary"
                : "font-app-semibold text-sm text-textOnPrimary"
            }
          >
            {isSupporting ? "Supporting" : "Support"}
          </Text>
        </HStack>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={followLabel}
        onPress={onToggleFollow}
        className="flex-1"
      >
        <HStack
          spacing="xs"
          align="center"
          justify="center"
          className="rounded-full border border-text/20 py-3"
        >
          {isFollowed ? (
            <Ionicons name="checkmark" size={15} color={COLORS.text} />
          ) : null}
          <Text className="font-app-semibold text-sm text-text">
            {isFollowed ? "Following" : "Follow"}
          </Text>
        </HStack>
      </Pressable>
    </HStack>
  );
};

export default ArtistProfileActions;
