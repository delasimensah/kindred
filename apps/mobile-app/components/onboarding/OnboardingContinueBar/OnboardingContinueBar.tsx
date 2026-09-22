import { LinearGradient } from "expo-linear-gradient";
import React from "react";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import Button from "../../ui/Button/Button";
import { VStack } from "../../ui/Stack/Stack";

interface OnboardingContinueBarProps {
  disabled: boolean;
  loading?: boolean;
  onPress: () => void;
}

const OnboardingContinueBar: React.FC<OnboardingContinueBarProps> = ({
  disabled,
  loading = false,
  onPress,
}) => {
  const insets = useAppInsets();

  return (
    <VStack
      spacing="none"
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0"
    >
      <LinearGradient
        colors={[`${COLORS.page}00`, COLORS.page]}
        style={{
          paddingHorizontal: 24,
          paddingTop: 56,
          paddingBottom: insets.bottom + 36,
        }}
      >
        <Button
          text="Continue"
          size="lg"
          fullWidth
          variant={disabled ? "secondary" : "primary"}
          disabled={disabled}
          loading={loading}
          className={
            disabled ? "rounded-full bg-surface" : "rounded-full bg-primary"
          }
          textClassName={
            disabled
              ? "text-base font-app-semibold text-text/40"
              : "text-base font-app-semibold text-textOnPrimary"
          }
          style={{
            backgroundColor: disabled ? COLORS.surface : COLORS.primary,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: disabled ? 0 : 0.2,
            shadowRadius: 16,
            elevation: disabled ? 0 : 8,
            opacity: 1,
          }}
          onPress={onPress}
        />
      </LinearGradient>
    </VStack>
  );
};

export default OnboardingContinueBar;
