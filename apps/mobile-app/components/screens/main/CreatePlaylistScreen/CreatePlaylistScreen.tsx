import React, { useState } from "react";
import { Pressable } from "react-native";

import KeyboardFormView from "../../../ui/KeyboardFormView/KeyboardFormView";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import TextField from "../../../ui/TextField/TextField";

interface CreatePlaylistScreenProps {
  onCreate: (name: string) => void;
}

const CreatePlaylistScreen: React.FC<CreatePlaylistScreenProps> = ({
  onCreate,
}) => {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <KeyboardFormView includeTopSafeArea={false} contentJustify="flex-start">
      <VStack spacing="lg">
        <TextField
          label="Name"
          value={name}
          placeholder="My playlist"
          onChangeText={setName}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create"
          accessibilityState={{ disabled: trimmed.length === 0 }}
          disabled={trimmed.length === 0}
          onPress={() => onCreate(trimmed)}
        >
          <VStack
            spacing="none"
            align="center"
            justify="center"
            className={
              trimmed.length === 0
                ? "rounded-full bg-surface py-4"
                : "rounded-full bg-primary py-4"
            }
          >
            <Text
              className={
                trimmed.length === 0
                  ? "font-app-semibold text-sm text-text/40"
                  : "font-app-semibold text-sm text-textOnPrimary"
              }
            >
              Create
            </Text>
          </VStack>
        </Pressable>
      </VStack>
    </KeyboardFormView>
  );
};

export default CreatePlaylistScreen;
