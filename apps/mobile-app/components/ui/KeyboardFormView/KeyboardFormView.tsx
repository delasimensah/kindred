import React from "react";
import { ScrollView } from "react-native";
import { cn } from "shared";

import { useAppInsets } from "@/hooks";

import { VStack } from "../Stack/Stack";

interface KeyboardFormViewProps {
  children: React.ReactNode;
  className?: string;
  contentJustify?: "center" | "flex-start";
}

const KeyboardFormView: React.FC<KeyboardFormViewProps> = ({
  children,
  className,
  contentJustify = "center",
}) => {
  const insets = useAppInsets();

  return (
    <VStack className={cn("flex-1 bg-page", className)}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: contentJustify,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
      >
        {children}
      </ScrollView>
    </VStack>
  );
};

export default KeyboardFormView;
