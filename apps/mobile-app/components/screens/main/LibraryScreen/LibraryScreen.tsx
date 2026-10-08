import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";

import PlaylistCover from "../../../library/PlaylistCover/PlaylistCover";
import AccountAvatarButton from "../../../ui/AccountAvatarButton/AccountAvatarButton";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

const PAGE_PADDING = 24;
const GRID_GAP = 16;
const ARTIST_PREVIEW = 5;

export interface LibraryArtist {
  artistId: string;
  name: string;
  avatarUrl: string | null;
  supporting: boolean;
}

export interface LibraryRecentPlaylist {
  playlistId: string;
  name: string;
  trackCount: number;
  artworkUrls: string[];
}

interface LibraryScreenProps {
  displayName: string;
  avatarUrl?: string | null;
  /** Followed and supported artists. Undefined while they load. */
  artists?: LibraryArtist[];
  /** Newest first. Undefined while the list loads. */
  recentPlaylists?: LibraryRecentPlaylist[];
  onOpenAccount: () => void;
  onOpenArtist: (artistId: string) => void;
  onOpenPlaylists: () => void;
  onOpenPlaylist?: (playlistId: string, name: string) => void;
  onOpenLiked: () => void;
  onOpenDownloads: () => void;
  onOpenArtists: () => void;
  onOpenMix: () => void;
}

const PILLS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  key: "playlists" | "liked" | "downloads" | "mix";
}[] = [
  { key: "playlists", label: "Playlists", icon: "albums" },
  { key: "liked", label: "Liked songs", icon: "heart" },
  { key: "downloads", label: "Downloaded", icon: "download" },
  { key: "mix", label: "Make a mix", icon: "sparkles" },
];

const LibraryScreen: React.FC<LibraryScreenProps> = ({
  displayName,
  avatarUrl = null,
  artists,
  recentPlaylists,
  onOpenAccount,
  onOpenArtist,
  onOpenPlaylists,
  onOpenPlaylist,
  onOpenLiked,
  onOpenDownloads,
  onOpenArtists,
  onOpenMix,
}) => {
  const { height, width } = useWindowDimensions();
  const paddingTop = useTabScrollTopPad();
  const columns = width >= 700 ? 4 : 2;
  const tile = Math.floor(
    (width - PAGE_PADDING * 2 - GRID_GAP * (columns - 1)) / columns
  );
  const artistsLoading = artists === undefined;
  const artistRow = (artists ?? []).slice(0, ARTIST_PREVIEW);
  const recentLoading = recentPlaylists === undefined;
  const recent = (recentPlaylists ?? []).slice(0, columns * 2);
  const openers = {
    playlists: onOpenPlaylists,
    liked: onOpenLiked,
    downloads: onOpenDownloads,
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
        paddingHorizontal: PAGE_PADDING,
        minHeight: height + 240,
      }}
    >
      <HStack spacing="md" align="center" justify="between">
        <Text className="min-w-0 flex-1 font-display-bold text-3xl text-text">
          Library
        </Text>
        <AccountAvatarButton
          displayName={displayName}
          imageUrl={avatarUrl}
          onPress={onOpenAccount}
        />
      </HStack>
      {artistsLoading || artistRow.length > 0 ? (
        <View style={{ marginTop: 20, height: 108 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ height: 108, marginHorizontal: -PAGE_PADDING }}
            contentContainerStyle={{
              paddingHorizontal: PAGE_PADDING,
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            {artistsLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <VStack key={index} spacing="sm" align="center">
                    <SkeletonCard width={64} height={64} radius={32} />
                    <SkeletonCard width={48} height={10} radius={4} />
                  </VStack>
                ))
              : artistRow.map((artist) => (
                  <Pressable
                    key={artist.artistId}
                    accessibilityRole="button"
                    accessibilityLabel={
                      artist.supporting
                        ? `Open ${artist.name}, supporting`
                        : `Open ${artist.name}`
                    }
                    onPress={() => onOpenArtist(artist.artistId)}
                    style={{ width: 72, alignItems: "center" }}
                  >
                    <View
                      style={{
                        borderRadius: 36,
                        borderWidth: artist.supporting ? 2 : 0,
                        borderColor: COLORS.primary,
                        padding: artist.supporting ? 2 : 0,
                      }}
                    >
                      <PersonAvatar
                        displayName={artist.name}
                        imageUrl={artist.avatarUrl}
                        size={64}
                      />
                    </View>
                    <Text
                      className="mt-1.5 text-center text-xs text-text"
                      numberOfLines={1}
                    >
                      {artist.name}
                    </Text>
                  </Pressable>
                ))}
            {artistRow.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View all artists"
                onPress={onOpenArtists}
                style={{ width: 72, alignItems: "center" }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.surface,
                  }}
                >
                  <Ionicons name="people" size={22} color={COLORS.text} />
                </View>
                <Text
                  className="mt-1.5 text-center text-xs text-text"
                  numberOfLines={1}
                >
                  View all
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 20,
        }}
      >
        {PILLS.map((pill) => (
          <Pressable
            key={pill.key}
            accessibilityRole="button"
            accessibilityLabel={pill.label}
            onPress={openers[pill.key]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
              backgroundColor: COLORS.surface,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Ionicons name={pill.icon} size={16} color={COLORS.primary} />
            <Text className="font-app-medium text-sm text-text">
              {pill.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {recentLoading || recent.length > 0 ? (
        <VStack spacing="md" className="mt-8">
          <Text className="font-app-semibold text-lg text-text">Playlists</Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP }}
          >
            {recentLoading
              ? Array.from({ length: columns }, (_, index) => (
                  <VStack key={index} spacing="sm" style={{ width: tile }}>
                    <SkeletonCard width={tile} height={tile} radius={12} />
                    <SkeletonCard width={tile * 0.7} height={12} radius={4} />
                    <SkeletonCard width={tile * 0.4} height={10} radius={4} />
                  </VStack>
                ))
              : recent.map((playlist) => (
                  <Pressable
                    key={playlist.playlistId}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${playlist.name}`}
                    onPress={() =>
                      onOpenPlaylist?.(playlist.playlistId, playlist.name)
                    }
                    style={{ width: tile }}
                  >
                    <PlaylistCover
                      urls={playlist.artworkUrls}
                      size={tile}
                      radius={12}
                    />
                    <Text
                      className="mt-2 font-app-medium text-sm text-text"
                      numberOfLines={1}
                    >
                      {playlist.name}
                    </Text>
                    <Text className="text-xs text-text/50">
                      {playlist.trackCount === 1
                        ? "1 track"
                        : `${playlist.trackCount} tracks`}
                    </Text>
                  </Pressable>
                ))}
          </View>
        </VStack>
      ) : null}
    </ScrollView>
  );
};

export default LibraryScreen;
