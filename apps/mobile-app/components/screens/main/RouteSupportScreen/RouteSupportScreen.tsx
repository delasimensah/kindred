import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import {
  canSaveRoute,
  MAX_ROUTES,
  routeChangeLine,
  routeStatusLine,
  splitCallout,
} from "@/utils";

import Button from "../../../ui/Button/Button";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export type RouteArtist = {
  artistId: string;
  name: string;
  avatarUrl: string | null;
};

interface RouteSupportScreenProps {
  artists: RouteArtist[];
  selectedIds: string[];
  routedArtistIds: string[];
  lockedArtistId: string | null;
  followFirstName: string | null;
  isLoading: boolean;
  isSaving: boolean;
  subscriptionActive: boolean;
  isFollowing: boolean;
  notice: string | null;
  /** Account stack already shows the back button, so this page does not draw another. */
  embedded?: boolean;
  onBack: () => void;
  onToggle: (artistId: string) => void;
  onFollow: () => void;
  onSave: () => void;
}

const RouteSupportScreen: React.FC<RouteSupportScreenProps> = ({
  artists,
  selectedIds,
  routedArtistIds,
  lockedArtistId,
  followFirstName,
  isLoading,
  isSaving,
  subscriptionActive,
  isFollowing,
  notice,
  embedded = false,
  onBack,
  onToggle,
  onFollow,
  onSave,
}) => {
  const insets = useAppInsets();
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - 48 - 24) / 3);
  const count = selectedIds.length;
  const saveEnabled = canSaveRoute(selectedIds, lockedArtistId) && !isSaving;
  const routedNames = artists
    .filter((artist) => routedArtistIds.includes(artist.artistId))
    .map((artist) => artist.name);
  const statusLine = routeStatusLine(routedNames);
  const changeLine = routeChangeLine({
    selectedIds,
    routedIds: routedArtistIds,
    nameFor: (artistId) =>
      artists.find((artist) => artist.artistId === artistId)?.name ?? "",
  });
  const showSplit = count >= 2 && count <= MAX_ROUTES;

  return (
    <VStack
      className="flex-1 bg-page"
      style={embedded ? undefined : { paddingTop: insets.top }}
    >
      {embedded ? null : (
        <HStack justify="between" align="center" className="px-6 pb-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            className="h-9 w-9 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="chevron-back" size={16} color={COLORS.text} />
          </Pressable>
          <Text className="rounded-full bg-surface px-3.5 py-1.5 font-app-semibold text-sm text-primary">
            {count} / {MAX_ROUTES}
          </Text>
        </HStack>
      )}
      {isLoading ? (
        <VStack spacing="lg" className="px-6 pt-4">
          <VStack className="h-8 w-56 rounded-xl bg-surface" />
          <VStack className="h-4 w-64 rounded-lg bg-surface" />
          <VStack className="h-14 rounded-2xl bg-surface" />
          <HStack spacing="sm">
            <VStack className="h-28 flex-1 rounded-2xl bg-surface" />
            <VStack className="h-28 flex-1 rounded-2xl bg-surface" />
            <VStack className="h-28 flex-1 rounded-2xl bg-surface" />
          </HStack>
        </VStack>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
            gap: 24,
          }}
        >
          <VStack spacing="sm">
            <Text className="font-display-bold text-[26px] leading-tight tracking-tight text-text">
              Route your support.
            </Text>
            <Text className="text-sm leading-relaxed text-text/60">
              Pick 1 to 5 artists you follow. Split is equal.
            </Text>
            {statusLine !== null ? (
              <Text className="text-sm leading-relaxed text-primary">
                {statusLine}
              </Text>
            ) : null}
            {changeLine !== null && count <= MAX_ROUTES ? (
              <Text className="text-sm leading-relaxed text-text">
                {changeLine}
              </Text>
            ) : null}
          </VStack>
          <HStack
            spacing="sm"
            align="center"
            className="rounded-2xl bg-surface px-4 py-3.5"
          >
            <VStack
              align="center"
              justify="center"
              className="h-9 w-9 rounded-full bg-primary/15"
            >
              <Ionicons name="scale-outline" size={16} color={COLORS.primary} />
            </VStack>
            <Text className="min-w-0 flex-1 font-app-medium text-sm text-text">
              {count > MAX_ROUTES && changeLine !== null ? (
                changeLine
              ) : showSplit ? (
                <>
                  Each gets{" "}
                  <Text className="font-app-bold text-sm text-primary">
                    {Math.floor(100 / count)}%
                  </Text>
                </>
              ) : (
                splitCallout(count)
              )}
            </Text>
          </HStack>
          {followFirstName !== null ? (
            <VStack spacing="sm" className="rounded-2xl bg-surface p-4">
              <Text className="text-sm text-text">
                Follow {followFirstName} before they can be part of this route.
              </Text>
              <Button
                text={`Follow ${followFirstName}`}
                variant="primary"
                fullWidth
                loading={isFollowing}
                onPress={onFollow}
              />
            </VStack>
          ) : (
            <HStack align="start" className="flex-wrap gap-3" spacing="none">
              {artists.map((artist) => {
                const selected = selectedIds.includes(artist.artistId);
                const locked = artist.artistId === lockedArtistId;
                const alreadyRouted = routedArtistIds.includes(artist.artistId);
                return (
                  <Pressable
                    key={artist.artistId}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: locked }}
                    accessibilityLabel={artist.name}
                    onPress={() => onToggle(artist.artistId)}
                    className={`items-center gap-2 rounded-2xl border-2 bg-surface px-2 py-3 ${
                      selected ? "border-primary" : "border-transparent"
                    }`}
                    style={{ width: cardWidth }}
                  >
                    <VStack className="relative">
                      <PersonAvatar
                        displayName={artist.name}
                        imageUrl={artist.avatarUrl}
                        size={56}
                      />
                      {selected ? (
                        <VStack
                          align="center"
                          justify="center"
                          className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary"
                        >
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={COLORS.page}
                          />
                        </VStack>
                      ) : null}
                    </VStack>
                    <Text
                      className={`text-center font-app-medium text-xs leading-tight ${
                        selected ? "text-text" : "text-text/60"
                      }`}
                    >
                      {artist.name}
                    </Text>
                    {alreadyRouted && selected ? (
                      <Text className="text-center text-[10px] text-primary">
                        In your route
                      </Text>
                    ) : null}
                    {alreadyRouted && !selected ? (
                      <Text className="text-center text-[10px] text-primary">
                        Removing
                      </Text>
                    ) : null}
                    {!alreadyRouted &&
                    selected &&
                    routedArtistIds.length > 0 ? (
                      <Text className="text-center text-[10px] text-primary">
                        Adding
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </HStack>
          )}
          <HStack spacing="sm" align="start" className="px-1">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={`${COLORS.text}4D`}
            />
            <Text className="min-w-0 flex-1 text-xs leading-relaxed text-text/40">
              Unfollow is blocked while an artist is routed — remove them here
              first.
            </Text>
          </HStack>
          {notice !== null ? (
            <Text className="text-center text-sm text-text/60">{notice}</Text>
          ) : null}
        </ScrollView>
      )}
      <VStack
        className="px-6 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          text="Save routing"
          variant="primary"
          size="lg"
          fullWidth
          disabled={
            !saveEnabled || followFirstName !== null || !subscriptionActive
          }
          loading={isSaving}
          onPress={onSave}
        />
      </VStack>
    </VStack>
  );
};

export default RouteSupportScreen;
