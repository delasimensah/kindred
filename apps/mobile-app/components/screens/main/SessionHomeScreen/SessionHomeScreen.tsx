import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";

import AuthWordmark from "../../../auth/AuthWordmark/AuthWordmark";
import Button from "../../../ui/Button/Button";
import KeyboardFormView from "../../../ui/KeyboardFormView/KeyboardFormView";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import type { ArtistRequestViewStatus } from "../ArtistRequestScreen/ArtistRequestScreen";

const STATUS_LABEL: Record<ArtistRequestViewStatus, string> = {
  none: "None",
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
};

interface SessionHomeScreenProps {
  displayName: string;
  isSigningOut: boolean;
  artistStatus: ArtistRequestViewStatus | "loading";
  supporterLabel: string | null;
  onRequestArtist: () => void;
  onOpenPaywall: () => void;
  onSignOut: () => void;
}

const SessionHomeScreen: React.FC<SessionHomeScreenProps> = ({
  displayName,
  isSigningOut,
  artistStatus,
  supporterLabel,
  onRequestArtist,
  onOpenPaywall,
  onSignOut,
}) => {
  return (
    <KeyboardFormView includeTopSafeArea={false} contentJustify="flex-start">
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
        <VStack spacing="sm">
          <Text className="px-1 font-app-medium text-xs uppercase tracking-wide text-text/40">
            Support
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back the artists you believe in"
            onPress={onOpenPaywall}
            className="rounded-2xl bg-surface px-4 py-4"
          >
            <HStack spacing="sm" align="center">
              <VStack
                spacing="none"
                align="center"
                justify="center"
                className="h-9 w-9 rounded-xl bg-primary/15"
              >
                <Ionicons
                  name="heart-outline"
                  size={16}
                  color={COLORS.primary}
                />
              </VStack>
              <Text className="min-w-0 flex-1 font-app-medium text-sm text-text">
                Back the artists you believe in
              </Text>
              {supporterLabel !== null ? (
                <Text className="text-xs text-text/40">{supporterLabel}</Text>
              ) : null}
              <Ionicons
                name="chevron-forward"
                size={14}
                color={`${COLORS.text}4D`}
              />
            </HStack>
          </Pressable>
        </VStack>
        <VStack spacing="sm">
          <Text className="px-1 font-app-medium text-xs uppercase tracking-wide text-text/40">
            Artist
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Request to become an artist"
            onPress={onRequestArtist}
            className="rounded-2xl bg-surface px-4 py-4"
          >
            <HStack spacing="sm" align="center">
              <VStack
                spacing="none"
                align="center"
                justify="center"
                className="h-9 w-9 rounded-xl bg-primary/15"
              >
                <Ionicons name="mic-outline" size={16} color={COLORS.primary} />
              </VStack>
              <Text className="min-w-0 flex-1 font-app-medium text-sm text-text">
                Request to become an artist
              </Text>
              {artistStatus === "loading" ? (
                <SkeletonCard width={48} height={14} radius={4} tone="page" />
              ) : (
                <Text className="text-xs text-text/40">
                  {STATUS_LABEL[artistStatus]}
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={14}
                color={`${COLORS.text}4D`}
              />
            </HStack>
          </Pressable>
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
