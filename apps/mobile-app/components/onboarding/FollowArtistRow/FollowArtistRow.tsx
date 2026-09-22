import React from "react";
import { Pressable } from "react-native";

import PersonAvatar from "../../ui/PersonAvatar/PersonAvatar";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface FollowArtistRowProps {
  name: string;
  bio: string;
  imageUrl?: string | null;
  isFollowed: boolean;
  onToggle: () => void;
}

const FollowArtistRow: React.FC<FollowArtistRowProps> = ({
  name,
  bio,
  imageUrl,
  isFollowed,
  onToggle,
}) => {
  return (
    <HStack spacing="md" align="center" className="py-3">
      <PersonAvatar displayName={name} imageUrl={imageUrl} size={56} />
      <VStack spacing="none" className="min-w-0 flex-1">
        <Text
          className="font-app-semibold text-[15px] text-text"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-xs text-text/40" numberOfLines={1}>
          {bio}
        </Text>
      </VStack>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFollowed ? `Following ${name}` : `Follow ${name}`}
        onPress={onToggle}
        className={
          isFollowed
            ? "rounded-full border border-primary bg-primary px-4 py-2"
            : "rounded-full border border-text/25 px-4 py-2"
        }
      >
        <Text
          className={
            isFollowed
              ? "font-app-semibold text-[13px] text-textOnPrimary"
              : "font-app-semibold text-[13px] text-text"
          }
        >
          {isFollowed ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </HStack>
  );
};

export default FollowArtistRow;
