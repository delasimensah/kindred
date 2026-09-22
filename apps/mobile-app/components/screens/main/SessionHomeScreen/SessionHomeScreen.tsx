import React from "react";

import AuthWordmark from "../../../auth/AuthWordmark/AuthWordmark";
import Button from "../../../ui/Button/Button";
import KeyboardFormView from "../../../ui/KeyboardFormView/KeyboardFormView";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface SessionHomeScreenProps {
  displayName: string;
  isSigningOut: boolean;
  onSignOut: () => void;
}

const SessionHomeScreen: React.FC<SessionHomeScreenProps> = ({
  displayName,
  isSigningOut,
  onSignOut,
}) => {
  return (
    <KeyboardFormView>
      <VStack spacing="lg" className="w-full">
        <AuthWordmark />
        <VStack spacing="sm" align="center">
          <Text className="font-app-semibold text-2xl text-text">
            You are in
          </Text>
          {displayName.length > 0 ? (
            <Text className="text-center text-sm text-text/50">
              Signed in as {displayName}
            </Text>
          ) : null}
        </VStack>
        <Button
          text="Sign out"
          variant="secondary"
          size="lg"
          fullWidth
          loading={isSigningOut}
          className="rounded-full"
          onPress={onSignOut}
        />
      </VStack>
    </KeyboardFormView>
  );
};

export default SessionHomeScreen;
