import React, { useMemo } from "react";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface OnboardingHeaderProps {
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  title,
  subtitle,
  trailing,
}) => {
  const reduceMotion = useReducedMotion();
  const entering = useMemo(
    () => (reduceMotion ? undefined : FadeInDown.duration(420)),
    [reduceMotion]
  );

  const copy = (
    <VStack spacing="sm" className="min-w-0 flex-1">
      <Text className="font-display-bold text-3xl text-text">{title}</Text>
      <Text className="text-sm text-text/50">{subtitle}</Text>
    </VStack>
  );

  return (
    <Animated.View entering={entering}>
      {trailing ? (
        <HStack spacing="md" align="start">
          {copy}
          {trailing}
        </HStack>
      ) : (
        copy
      )}
    </Animated.View>
  );
};

export default OnboardingHeader;
