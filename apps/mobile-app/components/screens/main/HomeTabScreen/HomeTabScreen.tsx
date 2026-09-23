import React from "react";
import { ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";

import AccountAvatarButton from "../../../ui/AccountAvatarButton/AccountAvatarButton";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { HStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface HomeTabScreenProps {
  displayName: string;
  onOpenAccount: () => void;
}

/**
 * ScrollView is the screen root so iOS 26 can minimize the tab bar and split
 * the mini-player on scroll. Fixed corner glow is deferred — same constraint
 * as Discover.
 * https://docs.expo.dev/versions/latest/sdk/router/native-tabs/
 */
const HomeTabScreen: React.FC<HomeTabScreenProps> = ({
  displayName,
  onOpenAccount,
}) => {
  const paddingTop = useTabScrollTopPad();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop,
        paddingBottom: 32,
        paddingHorizontal: 24,
      }}
    >
      <HStack spacing="md" align="center" justify="between">
        <Text className="font-display-bold text-3xl text-text">Home</Text>
        <AccountAvatarButton
          displayName={displayName}
          onPress={onOpenAccount}
        />
      </HStack>
      <CollectionEmptyState
        compact
        icon="megaphone"
        title="No updates yet"
        subtitle="Posts from artists you follow show up here."
      />
    </ScrollView>
  );
};

export default HomeTabScreen;
