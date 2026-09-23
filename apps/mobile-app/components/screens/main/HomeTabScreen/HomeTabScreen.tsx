import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";

import AccountAvatarButton from "../../../ui/AccountAvatarButton/AccountAvatarButton";
import { HStack, VStack } from "../../../ui/Stack/Stack";
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
  const { height } = useWindowDimensions();
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
        minHeight: height + 240,
      }}
    >
      <HStack spacing="md" align="center" justify="between">
        <Text className="font-display-bold text-3xl text-text">Home</Text>
        <AccountAvatarButton
          displayName={displayName}
          onPress={onOpenAccount}
        />
      </HStack>
      <VStack spacing="sm" className="mt-8">
        <Text className="font-app-semibold text-lg text-text">Updates</Text>
        <Text className="text-sm text-text/50">
          Posts from artists you follow show up here.
        </Text>
      </VStack>
    </ScrollView>
  );
};

export default HomeTabScreen;
