import React from "react";
import { Pressable, ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatAge, formatDuration } from "@/utils";

import ArtistProfileActions from "../../../catalog/ArtistProfileActions/ArtistProfileActions";
import ArtistProfileHero from "../../../catalog/ArtistProfileHero/ArtistProfileHero";
import ArtistUpdateCard from "../../../catalog/ArtistUpdateCard/ArtistUpdateCard";
import PopularTrackRow from "../../../catalog/PopularTrackRow/PopularTrackRow";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import ArtistProfileScreenSkeleton from "./ArtistProfileScreenSkeleton";

export interface ArtistProfileTrack {
  trackId: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
}

export interface ArtistProfileUpdate {
  postId: string;
  createdAt: number;
  audience: "everyone" | "supporters";
  body: string | null;
  locked: boolean;
}

export interface ArtistProfile {
  name: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  isFollowed: boolean;
}

interface ArtistProfileScreenProps {
  artist: ArtistProfile | null;
  tracks: ArtistProfileTrack[];
  updates: ArtistProfileUpdate[];
  isLoading: boolean;
  now: number;
  hasMoreTracks: boolean;
  playingTrackId: string | null;
  isPlaying: boolean;
  onToggleFollow: () => void;
  onPlay: (trackId: string) => void;
  onOpenLocked: (trackId: string) => void;
  onViewAllTracks: () => void;
  onSupport: () => void;
}

const ArtistProfileScreen: React.FC<ArtistProfileScreenProps> = ({
  artist,
  tracks,
  updates,
  isLoading,
  now,
  hasMoreTracks,
  playingTrackId,
  isPlaying,
  onToggleFollow,
  onPlay,
  onOpenLocked,
  onViewAllTracks,
  onSupport,
}) => {
  const insets = useAppInsets();

  if (isLoading) {
    return <ArtistProfileScreenSkeleton />;
  }

  if (artist === null) {
    return (
      <VStack
        spacing="md"
        padding="lg"
        className="flex-1 bg-page"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-sm text-text/50">
          This artist is not available.
        </Text>
      </VStack>
    );
  }

  // Cover runs under the transparent stack header and its system back button.
  // https://docs.expo.dev/router/advanced/stack/
  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <ArtistProfileHero
        name={artist.name}
        imageUrl={artist.coverUrl ?? artist.avatarUrl}
      />
      <VStack spacing="lg" paddingX="lg" paddingY="lg">
        <ArtistProfileActions
          name={artist.name}
          isFollowed={artist.isFollowed}
          onToggleFollow={onToggleFollow}
          onSupport={onSupport}
        />
        <VStack spacing="sm">
          <HStack spacing="sm" align="center" justify="between">
            <Text className="font-app-semibold text-lg text-text">
              Popular tracks
            </Text>
            {hasMoreTracks ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View all popular tracks"
                onPress={onViewAllTracks}
              >
                <Text className="font-app-semibold text-sm text-primary">
                  View all
                </Text>
              </Pressable>
            ) : null}
          </HStack>
          {tracks.length === 0 ? (
            <Text className="text-sm text-text/50">
              No published tracks yet.
            </Text>
          ) : (
            tracks.map((track) => (
              <PopularTrackRow
                key={track.trackId}
                title={track.title}
                subtitle={
                  track.locked
                    ? "Supporters only"
                    : formatDuration(track.durationMs)
                }
                artworkUrl={track.artworkUrl}
                locked={track.locked}
                isPlaying={isPlaying && playingTrackId === track.trackId}
                onPlay={() => onPlay(track.trackId)}
                onOpenLocked={() => onOpenLocked(track.trackId)}
              />
            ))
          )}
        </VStack>
        <VStack spacing="sm">
          <Text className="font-app-semibold text-lg text-text">Updates</Text>
          {updates.length === 0 ? (
            <Text className="text-sm text-text/50">No updates yet.</Text>
          ) : (
            updates.map((update) => (
              <ArtistUpdateCard
                key={update.postId}
                whenLabel={formatAge(update.createdAt, now)}
                audienceLabel={
                  update.audience === "supporters" || update.locked
                    ? "Supporters only"
                    : "Public"
                }
                body={update.body}
                locked={update.locked}
              />
            ))
          )}
        </VStack>
        <VStack spacing="sm">
          <Text className="font-app-semibold text-lg text-text">About</Text>
          <VStack
            spacing="none"
            padding="md"
            className="rounded-2xl bg-surface"
          >
            <Text className="text-sm text-text/60">{artist.bio}</Text>
          </VStack>
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export default ArtistProfileScreen;
