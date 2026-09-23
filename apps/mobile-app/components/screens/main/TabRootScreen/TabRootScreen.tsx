import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";

import AccountAvatarButton from "../../../ui/AccountAvatarButton/AccountAvatarButton";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface TabRootScreenProps {
  title: string;
  body: string;
  displayName?: string;
  onOpenAccount?: () => void;
}

/**
 * ScrollView is the screen root so iOS 26 can minimize the tab bar and split
 * the mini-player on scroll. Fixed corner glow is deferred — same constraint
 * as Discover.
 * https://docs.expo.dev/versions/latest/sdk/router/native-tabs/
 */
const TabRootScreen: React.FC<TabRootScreenProps> = ({
  title,
  body,
  displayName,
  onOpenAccount,
}) => {
  const { height } = useWindowDimensions();
  const paddingTop = useTabScrollTopPad();
  const showAccount =
    displayName !== undefined &&
    displayName.length > 0 &&
    onOpenAccount !== undefined;

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop,
        paddingBottom: 32,
        paddingHorizontal: 24,
        minHeight: height + 240,
      }}
    >
      <HStack spacing="md" align="center" justify="between">
        <Text className="min-w-0 flex-1 font-display-bold text-3xl text-text">
          {title}
        </Text>
        {showAccount ? (
          <AccountAvatarButton
            displayName={displayName}
            onPress={onOpenAccount}
          />
        ) : null}
      </HStack>
      <VStack spacing="sm" className="mt-2">
        <Text className="text-sm text-text/50">{body}</Text>
      </VStack>
    </ScrollView>
  );
};

export default TabRootScreen;
