import React from "react";
import { ScrollView } from "react-native";
import { cn } from "shared";

import { useAppInsets } from "@/hooks";

import { VStack } from "../Stack/Stack";

interface KeyboardFormViewProps {
  children: React.ReactNode;
  className?: string;
  contentJustify?: "center" | "flex-start";
  /** When false, skip the status-bar inset (native header already owns it). */
  includeTopSafeArea?: boolean;
}

const KeyboardFormView: React.FC<KeyboardFormViewProps> = ({
  children,
  className,
  contentJustify = "center",
  includeTopSafeArea = true,
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
          paddingTop: includeTopSafeArea ? insets.top + 24 : 24,
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
