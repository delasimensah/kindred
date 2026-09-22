import React from "react";

import { HStack, VStack } from "../../ui/Stack/Stack";

/** Space below the safe area that the pinned bars occupy. */
export const ONBOARDING_PROGRESS_BAND = 36;

interface OnboardingProgressProps {
  step: 1 | 2;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ step }) => {
  return (
    <HStack spacing="sm" className="w-full">
      <VStack
        spacing="none"
        className="h-1 flex-1 rounded-full bg-primary"
        accessibilityLabel="Step 1 of 2"
      />
      <VStack
        spacing="none"
        className={
          step === 2
            ? "h-1 flex-1 rounded-full bg-primary"
            : "h-1 flex-1 rounded-full bg-surface"
        }
        accessibilityLabel="Step 2 of 2"
      />
    </HStack>
  );
};

export default OnboardingProgress;
