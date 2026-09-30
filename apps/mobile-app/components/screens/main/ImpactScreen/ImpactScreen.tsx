import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView } from "react-native";
import { formatUsdFromCents } from "shared";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export type ImpactArtist = {
  artistId: string;
  name: string;
  avatarUrl: string | null;
  founding: boolean;
  inRoute: boolean;
  sharePercent: number;
  amountCents: number;
  sinceCents: number;
};

interface ImpactScreenProps {
  isLoading: boolean;
  entitled: boolean;
  totalCents: number;
  sinceCents: number;
  artists: ImpactArtist[];
  onManageRouting: () => void;
}

function firstName(name: string): string {
  const word = name.split(" ")[0];
  return word === undefined || word.length === 0 ? name : word;
}

const ImpactScreen: React.FC<ImpactScreenProps> = ({
  isLoading,
  entitled,
  totalCents,
  sinceCents,
  artists,
  onManageRouting,
}) => {
  const insets = useAppInsets();

  if (isLoading) {
    return (
      <VStack spacing="lg" className="flex-1 bg-page px-5 pt-4">
        <VStack className="h-40 rounded-3xl bg-surface" />
        <VStack className="h-5 w-28 rounded-lg bg-surface" />
        <VStack className="h-16 rounded-2xl bg-surface" />
        <VStack className="h-16 rounded-2xl bg-surface" />
        <VStack className="h-16 rounded-2xl bg-surface" />
        <VStack className="h-24 rounded-2xl bg-surface" />
      </VStack>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: insets.bottom + 24,
        gap: 24,
      }}
    >
      <VStack
        spacing="sm"
        align="center"
        className="rounded-3xl border border-text/5 bg-surface/40 px-4 py-5"
      >
        <Text className="font-app-semibold text-xs uppercase tracking-wider text-text/50">
          This month only
        </Text>
        <Text className="font-display-bold text-[56px] leading-none tracking-tight text-primary">
          {entitled ? formatUsdFromCents(totalCents) : "$0.00"}
        </Text>
        <Text className="max-w-[240px] pt-2 text-center text-xs leading-relaxed text-text/40">
          {entitled
            ? "Split equally across the artists you route your subscription to."
            : "Your subscription is not active."}
        </Text>
        {entitled ? (
          <Text className="font-app-medium text-sm text-primary">
            Since you started {formatUsdFromCents(sinceCents)}
          </Text>
        ) : null}
      </VStack>

      {artists.length > 0 ? (
        <VStack spacing="sm">
          <HStack justify="between" align="center">
            <Text className="font-app-semibold text-base text-text">
              Breakdown
            </Text>
            <Text className="font-app-medium text-xs text-text/40">
              Equal split
            </Text>
          </HStack>
          {artists.map((artist) => (
            <HStack
              key={artist.artistId}
              spacing="sm"
              align="center"
              className="rounded-2xl bg-surface p-4"
            >
              <PersonAvatar
                displayName={artist.name}
                imageUrl={artist.avatarUrl}
                size={48}
              />
              <VStack spacing="none" className="min-w-0 flex-1">
                <HStack spacing="sm" align="center">
                  <Text
                    className="min-w-0 flex-1 font-app-medium text-sm text-text"
                    numberOfLines={1}
                  >
                    {artist.name}
                  </Text>
                  {artist.founding ? (
                    <Text className="rounded-full bg-primary px-2 py-0.5 font-app-bold text-[9px] uppercase tracking-wide text-textOnPrimary">
                      Founding
                    </Text>
                  ) : null}
                </HStack>
                <Text className="mt-1 text-xs text-text/40">
                  {artist.inRoute
                    ? `${artist.sharePercent}% this month`
                    : "Not this month"}
                </Text>
                <Text className="text-xs text-text/60">
                  Since you started {formatUsdFromCents(artist.sinceCents)}
                </Text>
              </VStack>
              {artist.inRoute ? (
                <Text className="font-display-bold text-lg text-text">
                  {formatUsdFromCents(artist.amountCents)}
                </Text>
              ) : null}
            </HStack>
          ))}
        </VStack>
      ) : null}

      <VStack spacing="sm">
        <Text className="font-app-semibold text-base text-text">
          Founding badges
        </Text>
        <HStack
          spacing="sm"
          align="start"
          className="rounded-2xl bg-surface p-4"
        >
          <VStack
            spacing="none"
            align="center"
            justify="center"
            className="h-10 w-10 rounded-full bg-primary/15"
          >
            <Ionicons name="ribbon-outline" size={16} color={COLORS.primary} />
          </VStack>
          <Text className="flex-1 text-sm leading-relaxed text-text/70">
            A Founding badge stays when you were one of the first 10 people to
            route to that artist. It stays if other people leave.
          </Text>
        </HStack>
        {artists.length > 0 ? (
          <HStack spacing="md" align="start" className="flex-wrap px-1 pt-1">
            {artists.map((artist) => (
              <VStack
                key={artist.artistId}
                spacing="xs"
                align="center"
                className={artist.founding ? "" : "opacity-40"}
              >
                <PersonAvatar
                  displayName={artist.name}
                  imageUrl={artist.avatarUrl}
                  size={56}
                />
                <Text className="font-app-medium text-[11px] text-text/60">
                  {firstName(artist.name)}
                </Text>
              </VStack>
            ))}
          </HStack>
        ) : null}
      </VStack>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Manage routing"
        onPress={onManageRouting}
        className="rounded-2xl bg-surface px-4 py-4"
      >
        <HStack justify="between" align="center">
          <HStack spacing="sm" align="center">
            <Ionicons
              name="git-network-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text className="font-app-medium text-sm text-text">
              Manage routing
            </Text>
          </HStack>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={`${COLORS.text}4D`}
          />
        </HStack>
      </Pressable>
    </ScrollView>
  );
};

export default ImpactScreen;
