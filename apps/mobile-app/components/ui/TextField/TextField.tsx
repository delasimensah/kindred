import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, TextInput, type TextInputProps, View } from "react-native";
import { cn } from "shared";

import { COLORS, FONTS } from "@/constants";

import { VStack } from "../Stack/Stack";
import Text from "../Text/Text";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

const FIELD_HEIGHT = 52;

const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  className,
  secureTextEntry,
  style,
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <VStack spacing="sm">
      <Text className="font-app-bold text-[14px] text-text">{label}</Text>
      {/* View used: relative wrap so the password eye can sit on the field; do not change. */}
      <View className="relative justify-center overflow-visible">
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={`${COLORS.text}99`}
          secureTextEntry={isPassword && !passwordVisible}
          textAlignVertical="center"
          className={cn(
            "h-[52px] rounded-input border border-surface bg-surface px-3 text-[15px] text-text",
            isPassword && "pr-11",
            className
          )}
          {...props}
          style={[
            {
              height: FIELD_HEIGHT,
              paddingVertical: 0,
              fontFamily: FONTS.regular,
              fontSize: 15,
            },
            style,
          ]}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            onPress={() => {
              setPasswordVisible((visible) => !visible);
            }}
            className="absolute right-0 h-[52px] w-11 items-center justify-center"
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={20}
              color={COLORS.text}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
    </VStack>
  );
};

export default TextField;
