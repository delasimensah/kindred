import React from "react";
import { ScrollView, TextInput, useWindowDimensions, View } from "react-native";

import { COLORS, FONTS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";

import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

/**
 * Same page chrome as Home / Discover / Library (large title, same top inset).
 * Search field sits in the page — a Stack header would add a second top band
 * and push this title down.
 */
const SearchTabScreen: React.FC = () => {
  const { height } = useWindowDimensions();
  const paddingTop = useTabScrollTopPad();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        paddingTop,
        paddingBottom: 32,
        paddingHorizontal: 24,
        minHeight: height + 240,
      }}
    >
      <Text className="font-display-bold text-3xl text-text">Search</Text>
      <View
        className="mt-4 flex-row items-center rounded-full border border-white/10 bg-surface px-4"
        style={{ height: 48 }}
      >
        <TextInput
          accessibilityLabel="Search artists and tracks"
          placeholder="Artists, tracks"
          placeholderTextColor={`${COLORS.text}59`}
          className="flex-1 text-[15px] text-text"
          style={{
            fontFamily: FONTS.regular,
            fontSize: 15,
            paddingVertical: 0,
            color: COLORS.text,
          }}
        />
      </View>
      <VStack spacing="sm" className="mt-6">
        <Text className="text-sm text-text/50">Find artists and tracks.</Text>
      </VStack>
    </ScrollView>
  );
};

export default SearchTabScreen;
