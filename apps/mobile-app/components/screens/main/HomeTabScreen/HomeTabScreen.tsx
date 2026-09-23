import React from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants";

import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface HomeTabScreenProps {
  displayName: string;
  onOpenAccount: () => void;
}

const HomeTabScreen: React.FC<HomeTabScreenProps> = ({
  displayName,
  onOpenAccount,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 32,
        paddingHorizontal: 24,
        minHeight: height + 240,
      }}
    >
      <HStack spacing="md" align="center" justify="between">
        <Text className="font-display-bold text-2xl text-text">Kindred</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account"
          onPress={onOpenAccount}
        >
          <View className="rounded-full border-2 border-primary/30">
            <PersonAvatar displayName={displayName} size={40} />
          </View>
        </Pressable>
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
