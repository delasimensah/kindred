import React from "react";
import { Pressable, View } from "react-native";

import PersonAvatar from "../PersonAvatar/PersonAvatar";

interface AccountAvatarButtonProps {
  displayName: string;
  imageUrl?: string | null;
  onPress: () => void;
  size?: number;
}

/** Same avatar control on Home, Discover, and Library. */
const AccountAvatarButton: React.FC<AccountAvatarButtonProps> = ({
  displayName,
  imageUrl = null,
  onPress,
  size = 40,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Account"
      onPress={onPress}
    >
      <View className="rounded-full border-2 border-primary/30">
        <PersonAvatar
          displayName={displayName}
          imageUrl={imageUrl}
          size={size}
        />
      </View>
    </Pressable>
  );
};

export default AccountAvatarButton;
