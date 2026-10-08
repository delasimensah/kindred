import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, TextInput } from "react-native";

import { COLORS, FONTS } from "@/constants";

import { HStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface SearchFieldProps {
  draft: string;
  overlay: boolean;
  onChangeDraft: (value: string) => void;
  onFocus: () => void;
  onCancel: () => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  draft,
  overlay,
  onChangeDraft,
  onFocus,
  onCancel,
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <HStack spacing="sm" align="center" className="mt-4">
      <HStack
        spacing="sm"
        align="center"
        className="min-w-0 flex-1 rounded-full border border-white/10 bg-surface px-4"
        style={{ height: 48 }}
      >
        <Ionicons name="search" size={16} color={`${COLORS.text}66`} />
        <TextInput
          ref={inputRef}
          accessibilityLabel="Search artists and tracks"
          placeholder="Artists and tracks"
          placeholderTextColor={`${COLORS.text}59`}
          value={draft}
          onChangeText={onChangeDraft}
          onFocus={onFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 text-[15px] text-text"
          style={{
            flex: 1,
            fontFamily: FONTS.regular,
            fontSize: 15,
            paddingVertical: 0,
            color: COLORS.text,
          }}
        />
        {draft.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => {
              onChangeDraft("");
            }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={`${COLORS.text}66`}
            />
          </Pressable>
        ) : null}
      </HStack>
      {overlay ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel search"
          onPress={() => {
            onCancel();
            inputRef.current?.blur();
          }}
        >
          <Text className="font-app-semibold text-sm text-text">Cancel</Text>
        </Pressable>
      ) : null}
    </HStack>
  );
};

export default SearchField;
