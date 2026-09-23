import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, useWindowDimensions } from "react-native";

import { COLORS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";

import AccountAvatarButton from "../../../ui/AccountAvatarButton/AccountAvatarButton";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

interface LibraryScreenProps {
  displayName: string;
  onOpenAccount: () => void;
  onOpenPlaylists: () => void;
  onOpenLiked: () => void;
  onOpenDownloads: () => void;
  onOpenArtists: () => void;
  onOpenMix: () => void;
}

const ROWS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  key: "playlists" | "liked" | "downloads" | "artists" | "mix";
}[] = [
  { key: "playlists", label: "Playlists", icon: "albums" },
  { key: "liked", label: "Liked songs", icon: "heart" },
  { key: "downloads", label: "Downloaded", icon: "download" },
  { key: "artists", label: "Artists", icon: "people" },
  { key: "mix", label: "Make a mix", icon: "add" },
];

const LibraryScreen: React.FC<LibraryScreenProps> = ({
  displayName,
  onOpenAccount,
  onOpenPlaylists,
  onOpenLiked,
  onOpenDownloads,
  onOpenArtists,
  onOpenMix,
}) => {
  const { height } = useWindowDimensions();
  const paddingTop = useTabScrollTopPad();
  const openers = {
    playlists: onOpenPlaylists,
    liked: onOpenLiked,
    downloads: onOpenDownloads,
    artists: onOpenArtists,
    mix: onOpenMix,
  };

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop,
        paddingBottom: 32,
        paddingHorizontal: 24,
        minHeight: height + 240,
      }}
    >
      <HStack spacing="md" align="center" justify="between">
        <Text className="min-w-0 flex-1 font-display-bold text-3xl text-text">
          Library
        </Text>
        <AccountAvatarButton
          displayName={displayName}
          onPress={onOpenAccount}
        />
      </HStack>
      <VStack spacing="sm" className="mt-6">
        {ROWS.map((row) => (
          <Pressable
            key={row.key}
            accessibilityRole="button"
            accessibilityLabel={row.label}
            onPress={openers[row.key]}
          >
            <HStack
              spacing="md"
              align="center"
              padding="md"
              className="rounded-2xl bg-surface"
            >
              <HStack
                spacing="none"
                align="center"
                justify="center"
                className="h-12 w-12 rounded-xl bg-primary/10"
              >
                <Ionicons name={row.icon} size={20} color={COLORS.primary} />
              </HStack>
              <Text className="min-w-0 flex-1 font-app-semibold text-sm text-text">
                {row.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.text} />
            </HStack>
          </Pressable>
        ))}
      </VStack>
    </ScrollView>
  );
};

export default LibraryScreen;
