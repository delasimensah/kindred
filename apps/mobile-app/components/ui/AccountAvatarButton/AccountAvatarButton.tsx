import React from "react";
import { Pressable, View } from "react-native";

import PersonAvatar from "../PersonAvatar/PersonAvatar";

interface AccountAvatarButtonProps {
  displayName: string;
  onPress: () => void;
  size?: number;
}

/** Same avatar control on Home, Discover, and Library. */
const AccountAvatarButton: React.FC<AccountAvatarButtonProps> = ({
  displayName,
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
        <PersonAvatar displayName={displayName} size={size} />
      </View>
    </Pressable>
  );
};

export default AccountAvatarButton;
