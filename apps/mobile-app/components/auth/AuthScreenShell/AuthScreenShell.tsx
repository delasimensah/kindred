import React from "react";

import KeyboardFormView from "../../ui/KeyboardFormView/KeyboardFormView";
import { VStack } from "../../ui/Stack/Stack";
import AuthGlowBackground from "../AuthGlowBackground/AuthGlowBackground";

interface AuthScreenShellProps {
  glow: "welcome" | "sign-in" | "sign-up" | "onboarding";
  children: React.ReactNode;
}

const AuthScreenShell: React.FC<AuthScreenShellProps> = ({
  glow,
  children,
}) => {
  if (glow === "welcome" || glow === "onboarding") {
    return (
      <VStack className="flex-1 overflow-hidden bg-page">
        <AuthGlowBackground variant={glow} />
        {children}
      </VStack>
    );
  }

  return (
    <VStack className="flex-1 overflow-hidden bg-page">
      <AuthGlowBackground variant={glow} />
      <KeyboardFormView className="bg-transparent" contentJustify="flex-start">
        <VStack spacing="lg" className="w-full">
          {children}
        </VStack>
      </KeyboardFormView>
    </VStack>
  );
};

export default AuthScreenShell;
