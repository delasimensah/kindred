import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

import { COLORS } from "@/constants";

import KeyboardFormView from "../../../ui/KeyboardFormView/KeyboardFormView";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import type { ArtistRequestViewStatus } from "../ArtistRequestScreen/ArtistRequestScreen";

function skipUnbuiltRow(): void {
  return undefined;
}

const STATUS_LABEL: Record<ArtistRequestViewStatus, string> = {
  none: "None",
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
};

interface SessionHomeScreenProps {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  isSigningOut: boolean;
  artistStatus: ArtistRequestViewStatus | "loading";
  /** Null when this person is not paying. Undefined while the status is loading. */
  supporterLabel?: string | null;
  restoring: boolean;
  notice: string | null;
  onRequestArtist: () => void;
  onOpenRoute: () => void;
  onOpenImpact: () => void;
  onRestore: () => void;
  onManageSubscription: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
}

interface AccountRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  trailing?: string;
  trailingLoading?: boolean;
  external?: boolean;
  onPress?: () => void;
  showDivider?: boolean;
}

const AccountRow: React.FC<AccountRowProps> = ({
  icon,
  label,
  detail,
  trailing,
  trailingLoading = false,
  external = false,
  onPress,
  showDivider = false,
}) => {
  const body = (
    <HStack spacing="sm" align="center" className="px-4 py-3">
      <VStack
        spacing="none"
        align="center"
        justify="center"
        className="h-9 w-9 rounded-xl bg-primary/15"
      >
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </VStack>
      <VStack spacing="none" className="min-w-0 flex-1">
        <Text className="font-app-medium text-sm text-text">{label}</Text>
        {detail !== undefined ? (
          <Text className="text-xs text-text/40">{detail}</Text>
        ) : null}
      </VStack>
      {trailingLoading ? (
        <SkeletonCard width={48} height={14} radius={4} />
      ) : trailing !== undefined ? (
        <Text className="text-xs text-text/40">{trailing}</Text>
      ) : null}
      {onPress !== undefined ? (
        <Ionicons
          name={external ? "open-outline" : "chevron-forward"}
          size={14}
          color={`${COLORS.text}4D`}
        />
      ) : null}
    </HStack>
  );

  const row =
    onPress === undefined ? (
      body
    ) : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
      >
        {body}
      </Pressable>
    );

  return (
    <>
      {row}
      {showDivider ? <View className="mx-4 h-px bg-page" /> : null}
    </>
  );
};

const SessionHomeScreen: React.FC<SessionHomeScreenProps> = ({
  displayName,
  email,
  avatarUrl = null,
  isSigningOut,
  artistStatus,
  supporterLabel,
  restoring,
  notice,
  onRequestArtist,
  onOpenRoute,
  onOpenImpact,
  onRestore,
  onManageSubscription,
  onEditProfile,
  onSignOut,
}) => {
  const statusDetail =
    supporterLabel === undefined
      ? undefined
      : (supporterLabel ?? "Not subscribed");

  return (
    <KeyboardFormView includeTopSafeArea={false} contentJustify="flex-start">
      <VStack spacing="lg" className="w-full">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${displayName}`}
          onPress={onEditProfile}
          className="rounded-2xl bg-surface p-4"
        >
          <HStack spacing="md" align="center">
            <PersonAvatar
              displayName={displayName}
              imageUrl={avatarUrl}
              size={56}
            />
            <VStack spacing="none" className="min-w-0 flex-1">
              <Text
                className="font-app-semibold text-base text-text"
                numberOfLines={1}
              >
                {displayName}
              </Text>
              {email.length > 0 ? (
                <Text className="mt-0.5 text-xs text-text/40" numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
            </VStack>
            <Text className="font-app-semibold text-xs text-primary">Edit</Text>
          </HStack>
        </Pressable>

        <VStack spacing="sm">
          <Text className="px-1 font-app-medium text-xs uppercase tracking-wide text-text/40">
            Security
          </Text>
          <VStack
            spacing="none"
            className="overflow-hidden rounded-2xl bg-surface"
          >
            <AccountRow
              icon="lock-closed-outline"
              label="Change password"
              onPress={skipUnbuiltRow}
            />
          </VStack>
        </VStack>

        <VStack spacing="sm">
          <Text className="px-1 font-app-medium text-xs uppercase tracking-wide text-text/40">
            Subscription
          </Text>
          <VStack
            spacing="none"
            className="overflow-hidden rounded-2xl bg-surface"
          >
            {supporterLabel === undefined ? (
              <>
                <HStack spacing="sm" align="center" className="px-4 py-3">
                  <SkeletonCard width={36} height={36} radius={12} />
                  <VStack spacing="xs" className="flex-1">
                    <SkeletonCard width={140} height={14} radius={4} />
                    <SkeletonCard width={120} height={12} radius={4} />
                  </VStack>
                </HStack>
                <View className="mx-4 h-px bg-page" />
              </>
            ) : (
              <AccountRow
                icon="star-outline"
                label="Subscription status"
                detail={statusDetail}
                showDivider
              />
            )}
            <AccountRow
              icon="refresh-outline"
              label={restoring ? "Restoring purchases" : "Restore purchases"}
              onPress={onRestore}
              showDivider
            />
            <AccountRow
              icon="card-outline"
              label="Manage subscription"
              detail="Billing is managed in the App Store or Google Play"
              external
              onPress={onManageSubscription}
            />
          </VStack>
          {notice !== null ? (
            <Text className="px-1 text-xs leading-relaxed text-text/60">
              {notice}
            </Text>
          ) : null}
        </VStack>

        <VStack spacing="sm">
          <Text className="px-1 font-app-medium text-xs uppercase tracking-wide text-text/40">
            Support & activity
          </Text>
          <VStack
            spacing="none"
            className="overflow-hidden rounded-2xl bg-surface"
          >
            <AccountRow
              icon="git-network-outline"
              label="Route support"
              onPress={onOpenRoute}
              showDivider
            />
            <AccountRow
              icon="bar-chart-outline"
              label="Impact"
              onPress={onOpenImpact}
              showDivider
            />
            <AccountRow
              icon="download-outline"
              label="Downloads"
              onPress={skipUnbuiltRow}
              showDivider
            />
            <AccountRow
              icon="notifications-outline"
              label="Notification settings"
              onPress={skipUnbuiltRow}
            />
          </VStack>
        </VStack>

        <VStack spacing="sm">
          <Text className="px-1 font-app-medium text-xs uppercase tracking-wide text-text/40">
            Artist
          </Text>
          <VStack
            spacing="none"
            className="overflow-hidden rounded-2xl bg-surface"
          >
            <AccountRow
              icon="mic-outline"
              label="Request to become an artist"
              trailing={
                artistStatus === "loading"
                  ? undefined
                  : STATUS_LABEL[artistStatus]
              }
              trailingLoading={artistStatus === "loading"}
              onPress={onRequestArtist}
            />
          </VStack>
        </VStack>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          disabled={isSigningOut}
          onPress={onSignOut}
          className="rounded-2xl bg-surface py-4"
        >
          <HStack spacing="sm" align="center" justify="center">
            <Ionicons name="log-out-outline" size={16} color="#f87171" />
            <Text className="font-app-semibold text-sm text-red-400">
              {isSigningOut ? "Signing out" : "Sign out"}
            </Text>
          </HStack>
        </Pressable>
      </VStack>
    </KeyboardFormView>
  );
};

export default SessionHomeScreen;
