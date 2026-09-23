import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants";

import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface TabRootScreenProps {
  title: string;
  body: string;
}

const TabRootScreen: React.FC<TabRootScreenProps> = ({ title, body }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 32,
        paddingHorizontal: 24,
        minHeight: height + 240,
      }}
    >
      <VStack spacing="sm">
        <Text className="font-display-bold text-3xl text-text">{title}</Text>
        <Text className="text-sm text-text/50">{body}</Text>
      </VStack>
    </ScrollView>
  );
};

export default TabRootScreen;
