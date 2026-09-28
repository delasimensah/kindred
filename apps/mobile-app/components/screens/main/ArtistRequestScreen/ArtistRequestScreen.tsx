import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput } from "react-native";
import {
  ARTIST_REQUEST_BIO_MAX,
  ARTIST_REQUEST_NAME_MAX,
  ARTIST_REQUEST_WHY_MAX,
  getRelativeTime,
} from "shared";

import { COLORS, FONTS } from "@/constants";

import Button from "../../../ui/Button/Button";
import KeyboardFormView from "../../../ui/KeyboardFormView/KeyboardFormView";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export type ArtistRequestViewStatus =
  "none" | "pending" | "approved" | "declined";

export interface ArtistRequestValues {
  displayName: string;
  bio: string;
  note: string;
}

interface ArtistRequestScreenProps {
  status: ArtistRequestViewStatus;
  displayName: string;
  bio: string;
  note: string;
  declineReason: string | null;
  createdAt: number | null;
  submitting: boolean;
  onSubmit: (values: ArtistRequestValues) => void;
}

const ArtistRequestScreen: React.FC<ArtistRequestScreenProps> = ({
  status,
  displayName: initialName,
  bio: initialBio,
  note: initialNote,
  declineReason,
  createdAt,
  submitting,
  onSubmit,
}) => {
  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [note, setNote] = useState(initialNote);
  const canEdit = status === "none" || status === "declined";
  const canSubmit =
    canEdit &&
    !submitting &&
    displayName.trim().length > 0 &&
    bio.trim().length > 0 &&
    note.trim().length > 0;

  return (
    <KeyboardFormView includeTopSafeArea={false} contentJustify="flex-start">
      <VStack spacing="lg" className="w-full">
        {status === "pending" ? (
          <StatusBanner
            icon="hourglass-outline"
            title="Request pending review"
            body={
              createdAt === null
                ? "An admin reviews every request by hand."
                : `Submitted ${getRelativeTime(new Date(createdAt))} · An admin reviews every request by hand.`
            }
          />
        ) : null}
        {status === "declined" ? (
          <StatusBanner
            icon="close-circle-outline"
            title="Request declined"
            body={
              declineReason === null || declineReason.length === 0
                ? "You can send a new request."
                : declineReason
            }
          />
        ) : null}
        {status === "approved" ? (
          <StatusBanner
            icon="checkmark-circle-outline"
            title="You're an artist"
            body="Sign in to Artist Studio on the web to upload. This phone app stays your listener account."
          />
        ) : null}

        <VStack spacing="sm">
          <Text className="font-display-bold text-[26px] text-text">
            Become an artist.
          </Text>
          <Text className="text-sm leading-relaxed text-text/60">
            {status === "approved"
              ? "Your request was approved. Studio lives on the web."
              : status === "pending"
                ? "Here's what you sent."
                : "Tell us about yourself. Our team reviews every request by hand."}
          </Text>
        </VStack>

        {status === "pending" ? (
          <VStack spacing="lg">
            <RequestReceipt label="Display name" value={displayName} />
            <RequestReceipt label="Bio" value={bio} />
            <RequestReceipt
              label="Why do you want to join as an artist?"
              value={note}
            />
          </VStack>
        ) : null}

        {canEdit ? (
          <VStack spacing="lg">
            <RequestField
              label="Display name"
              value={displayName}
              placeholder="e.g. Efua Boateng"
              maxLength={ARTIST_REQUEST_NAME_MAX}
              onChangeText={setDisplayName}
            />
            <RequestField
              label="Bio"
              value={bio}
              placeholder="Share your sound, your story, and what makes your music yours."
              maxLength={ARTIST_REQUEST_BIO_MAX}
              lines={4}
              onChangeText={setBio}
            />
            <RequestField
              label="Why do you want to join as an artist?"
              value={note}
              placeholder="Tell us about your music, where it's been released, and links to your work."
              maxLength={ARTIST_REQUEST_WHY_MAX}
              lines={5}
              onChangeText={setNote}
            />
            <HStack spacing="sm" align="start" className="px-1">
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={`${COLORS.text}66`}
              />
              <Text className="min-w-0 flex-1 text-xs leading-relaxed text-text/40">
                Approved artist profiles get a badge and appear in search and
                recommendations.
              </Text>
            </HStack>
            <Button
              text="Submit request"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canSubmit}
              loading={submitting}
              textClassName="text-base"
              onPress={() => {
                onSubmit({
                  displayName: displayName.trim(),
                  bio: bio.trim(),
                  note: note.trim(),
                });
              }}
            />
          </VStack>
        ) : null}
      </VStack>
    </KeyboardFormView>
  );
};

function StatusBanner({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <HStack
      spacing="sm"
      align="center"
      className="rounded-2xl border border-primary/30 bg-surface px-4 py-3.5"
    >
      <VStack
        spacing="none"
        align="center"
        justify="center"
        className="h-9 w-9 rounded-full bg-primary/15"
      >
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </VStack>
      <VStack spacing="none" className="min-w-0 flex-1">
        <Text className="font-app-semibold text-sm text-text">{title}</Text>
        <Text className="mt-0.5 text-xs text-text/40">{body}</Text>
      </VStack>
    </HStack>
  );
}

function RequestReceipt({ label, value }: { label: string; value: string }) {
  return (
    <VStack spacing="sm">
      <Text className="font-app-medium text-xs uppercase tracking-wide text-text/60">
        {label}
      </Text>
      <VStack spacing="none" className="rounded-2xl bg-surface px-4 py-4">
        <Text className="text-sm leading-relaxed text-text">{value}</Text>
      </VStack>
    </VStack>
  );
}

function RequestField({
  label,
  value,
  placeholder,
  maxLength,
  lines,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  lines?: number;
  onChangeText: (value: string) => void;
}) {
  const multiline = lines !== undefined;
  return (
    <VStack spacing="sm">
      <HStack spacing="sm" align="center" justify="between">
        <Text className="min-w-0 flex-1 font-app-medium text-xs uppercase tracking-wide text-text/60">
          {label}
        </Text>
        {multiline ? (
          <Text
            className="text-xs text-text/30"
            accessibilityLabel={`${value.length} of ${maxLength} characters`}
          >
            {value.length} / {maxLength}
          </Text>
        ) : null}
      </HStack>
      <TextInput
        accessibilityLabel={label}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={`${COLORS.text}4D`}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        textAlignVertical={multiline ? "top" : "center"}
        className="rounded-2xl bg-surface px-4 text-sm text-text"
        style={{
          fontFamily: FONTS.regular,
          fontSize: 14,
          color: COLORS.text,
          minHeight: lines === undefined ? 52 : lines * 28 + 32,
          paddingVertical: 16,
        }}
      />
    </VStack>
  );
}

export function ArtistRequestSkeleton() {
  return (
    <VStack
      spacing="lg"
      padding="lg"
      className="flex-1 bg-page"
      accessible
      accessibilityLabel="Loading artist request"
    >
      <SkeletonCard width={220} height={28} radius={8} />
      <SkeletonCard width={280} height={16} radius={6} />
      <SkeletonCard width={320} height={52} radius={16} />
      <SkeletonCard width={320} height={112} radius={16} />
      <SkeletonCard width={320} height={140} radius={16} />
      <SkeletonCard width={320} height={52} radius={26} />
    </VStack>
  );
}

export default ArtistRequestScreen;
