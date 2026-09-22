import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, TextInput, type TextInputProps } from "react-native";
import { cn } from "shared";

import { COLORS, FONTS } from "@/constants";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface AuthTextFieldProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
}

const FIELD_HEIGHT = 52;

const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  icon,
  error,
  className,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <VStack spacing="sm" className="w-full">
      <HStack
        spacing="sm"
        align="center"
        className={cn(
          "h-[52px] w-full overflow-visible rounded-input border bg-surface px-4",
          focused ? "border-primary/50" : "border-text/5"
        )}
      >
        <Ionicons name={icon} size={16} color={COLORS.text} />
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={COLORS.text}
          secureTextEntry={isPassword && !passwordVisible}
          textAlignVertical="center"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn("flex-1 text-base text-text", className)}
          {...props}
          style={[
            {
              height: FIELD_HEIGHT,
              paddingVertical: 0,
              fontFamily: FONTS.regular,
              fontSize: 16,
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
            className="h-[52px] w-8 items-center justify-center"
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={16}
              color={COLORS.text}
            />
          </Pressable>
        ) : null}
      </HStack>
      {error ? <Text className="text-base text-danger">{error}</Text> : null}
    </VStack>
  );
};

export default AuthTextField;
