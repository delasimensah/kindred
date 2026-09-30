import React from "react";
import { Pressable } from "react-native";

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
        accessibilityLabel={followLabel}
        onPress={onToggleFollow}
        className="flex-1"
      >
        <HStack
          spacing="none"
          align="center"
          justify="center"
          className={
            isFollowed
              ? "rounded-full bg-primary py-3"
              : "rounded-full border border-text/20 py-3"
          }
        >
          <Text
            className={
              isFollowed
                ? "font-app-semibold text-sm text-textOnPrimary"
                : "font-app-semibold text-sm text-text"
            }
          >
            {isFollowed ? "Following" : "Follow"}
          </Text>
        </HStack>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={supportLabel}
        onPress={onSupport}
        className="flex-1"
      >
        <HStack
          spacing="none"
          align="center"
          justify="center"
          className={
            isSupporting
              ? "rounded-full bg-primary py-3"
              : "rounded-full border border-text/20 py-3"
          }
        >
          <Text
            className={
              isSupporting
                ? "font-app-semibold text-sm text-textOnPrimary"
                : "font-app-semibold text-sm text-text"
            }
          >
            {isSupporting ? "Supporting" : "Support"}
          </Text>
        </HStack>
      </Pressable>
    </HStack>
  );
};

export default ArtistProfileActions;
