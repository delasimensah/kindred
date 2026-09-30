import React, { useState } from "react";
import { Pressable, TextInput } from "react-native";

import { COLORS, FONTS } from "@/constants";

import Button from "../../../ui/Button/Button";
import KeyboardFormView from "../../../ui/KeyboardFormView/KeyboardFormView";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

const NAME_MAX = 80;

interface EditProfileScreenProps {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  savingName: boolean;
  savingPhoto: boolean;
  notice: string | null;
  onChangePhoto: () => void;
  onSaveName: (displayName: string) => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  displayName,
  email,
  avatarUrl,
  savingName,
  savingPhoto,
  notice,
  onChangePhoto,
  onSaveName,
}) => {
  const [name, setName] = useState(displayName);
  const trimmed = name.trim();
  const canSave =
    !savingName && trimmed.length > 0 && trimmed.length <= NAME_MAX;

  return (
    <KeyboardFormView includeTopSafeArea={false} contentJustify="flex-start">
      <VStack spacing="lg" className="w-full">
        <VStack spacing="sm" align="center">
          <PersonAvatar displayName={name} imageUrl={avatarUrl} size={88} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose photo"
            disabled={savingPhoto}
            onPress={onChangePhoto}
          >
            <Text className="font-app-semibold text-sm text-primary">
              {savingPhoto ? "Saving photo" : "Choose photo"}
            </Text>
          </Pressable>
        </VStack>

        <VStack spacing="sm">
          <Text className="font-app-medium text-xs uppercase tracking-wide text-text/60">
            Name
          </Text>
          <TextInput
            accessibilityLabel="Name"
            value={name}
            placeholder="Your name"
            placeholderTextColor={`${COLORS.text}4D`}
            maxLength={NAME_MAX}
            onChangeText={setName}
            className="rounded-2xl bg-surface px-4 text-sm text-text"
            style={{
              fontFamily: FONTS.regular,
              fontSize: 14,
              color: COLORS.text,
              minHeight: 52,
              paddingVertical: 16,
            }}
          />
        </VStack>

        <VStack spacing="sm">
          <Text className="font-app-medium text-xs uppercase tracking-wide text-text/60">
            Email
          </Text>
          <VStack spacing="none" className="rounded-2xl bg-surface px-4 py-4">
            <Text className="text-sm text-text">{email}</Text>
          </VStack>
          <Text className="px-1 text-xs text-text/40">
            This is your sign-in email.
          </Text>
        </VStack>

        {notice !== null ? (
          <Text className="px-1 text-xs leading-relaxed text-text/60">
            {notice}
          </Text>
        ) : null}

        <Button
          text="Save name"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSave}
          loading={savingName}
          textClassName="text-base"
          onPress={() => {
            onSaveName(trimmed);
          }}
        />
      </VStack>
    </KeyboardFormView>
  );
};

export default EditProfileScreen;
