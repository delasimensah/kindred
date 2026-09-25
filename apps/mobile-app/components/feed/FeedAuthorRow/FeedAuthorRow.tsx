import React from "react";
import { Pressable } from "react-native";

import PersonAvatar from "../../ui/PersonAvatar/PersonAvatar";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface FeedAuthorRowProps {
  name: string;
  avatarUrl: string | null;
  meta: string;
  onPress: () => void;
}

const FeedAuthorRow: React.FC<FeedAuthorRowProps> = ({
  name,
  avatarUrl,
  meta,
  onPress,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${name}`}
      onPress={onPress}
    >
      <HStack spacing="sm" align="center">
        <PersonAvatar displayName={name} imageUrl={avatarUrl} size={44} />
        <VStack spacing="none" className="min-w-0 flex-1">
          <Text
            className="font-app-semibold text-sm text-text"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text className="text-xs text-text/40">{meta}</Text>
        </VStack>
      </HStack>
    </Pressable>
  );
};

export default FeedAuthorRow;
