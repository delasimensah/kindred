import React from "react";
import { Pressable, ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";
import { formatAge, formatDuration } from "@/utils";

import ArtistAlbumsSection, {
  type ArtistAlbumSummary,
} from "../../../catalog/ArtistAlbumsSection/ArtistAlbumsSection";
import ArtistProfileActions from "../../../catalog/ArtistProfileActions/ArtistProfileActions";
import ArtistProfileHero from "../../../catalog/ArtistProfileHero/ArtistProfileHero";
import ArtistUpdateCard from "../../../catalog/ArtistUpdateCard/ArtistUpdateCard";
import PopularTrackRow from "../../../catalog/PopularTrackRow/PopularTrackRow";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import ArtistProfileScreenSkeleton from "./ArtistProfileScreenSkeleton";

export type { ArtistAlbumSummary };

export interface ArtistProfileTrack {
  trackId: string;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  liked: boolean;
}

export interface ArtistProfileUpdate {
  postId: string;
  createdAt: number;
  audience: "everyone" | "supporters";
  body: string | null;
  locked: boolean;
  photoUrl?: string | null;
  voiceDurationMs?: number | null;
  voiceUrl?: string | null;
  voicePeaks?: number[];
}

export interface ArtistProfile {
  name: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  isFollowed: boolean;
  followerCount: number;
  supporterCount: number;
  /** Approximate live listeners; number only, never identities. */
  liveListenerCount: number;
}

interface ArtistProfileScreenProps {
  artist: ArtistProfile | null;
  tracks: ArtistProfileTrack[];
  updates: ArtistProfileUpdate[];
  isLoading: boolean;
  now: number;
  hasMoreTracks: boolean;
  albums?: ArtistAlbumSummary[];
  hasMoreAlbums?: boolean;
  playingTrackId: string | null;
  isPlaying: boolean;
  playingVoiceUrl?: string | null;
  voiceActiveUrl?: string | null;
  voiceProgress?: number;
  heldVoiceUrl?: string | null;
  heldVoiceRatio?: number;
  onToggleFollow: () => void;
  onPlay: (trackId: string) => void;
  onPlayNext?: (trackId: string) => void;
  onAddToQueue?: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
  onViewAllTracks: () => void;
  onViewAllAlbums?: () => void;
  onOpenAlbum?: (releaseId: string) => void;
  isSupporting?: boolean;
  isFounding?: boolean;
  onSupport: () => void;
  onOpenLocked?: (trackId: string) => void;
  onToggleVoice?: (url: string) => void;
  onSeekVoice?: (url: string, ratio: number) => void;
}

const ArtistProfileScreen: React.FC<ArtistProfileScreenProps> = ({
  artist,
  tracks,
  updates,
  isLoading,
  now,
  hasMoreTracks,
  albums = [],
  hasMoreAlbums = false,
  playingTrackId,
  isPlaying,
  playingVoiceUrl = null,
  voiceActiveUrl = null,
  voiceProgress = 0,
  heldVoiceUrl = null,
  heldVoiceRatio = 0,
  onToggleFollow,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
  onViewAllTracks,
  onViewAllAlbums,
  onOpenAlbum,
  isSupporting = false,
  isFounding = false,
  onSupport,
  onOpenLocked,
  onToggleVoice,
  onSeekVoice,
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
        <CollectionEmptyState
          icon="person"
          title="Artist not available"
          subtitle="This artist may be hidden, or the link is no longer valid."
        />
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
      <ArtistProfileHero {...artist} />
      <VStack spacing="lg" paddingX="lg" paddingY="lg">
        {isFounding ? (
          <Text
            accessibilityLabel="Founding supporter"
            className="self-start rounded-full bg-primary px-2 py-0.5 font-app-bold text-[9px] uppercase tracking-wide text-textOnPrimary"
          >
            Founding
          </Text>
        ) : null}
        <ArtistProfileActions
          name={artist.name}
          isFollowed={artist.isFollowed}
          isSupporting={isSupporting}
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
            <CollectionEmptyState
              compact
              icon="musical-notes"
              title="No published tracks yet"
              subtitle="Tracks this artist publishes show up here."
            />
          ) : (
            tracks.map((track) => (
              <PopularTrackRow
                key={track.trackId}
                trackId={track.trackId}
                title={track.title}
                subtitle={
                  track.locked
                    ? "Supporters only"
                    : formatDuration(track.durationMs)
                }
                artworkUrl={track.artworkUrl}
                locked={track.locked}
                onOpenLocked={
                  onOpenLocked === undefined
                    ? undefined
                    : () => onOpenLocked(track.trackId)
                }
                liked={track.liked}
                isPlaying={isPlaying && playingTrackId === track.trackId}
                onPlay={() => onPlay(track.trackId)}
                onPlayNext={
                  onPlayNext === undefined
                    ? undefined
                    : () => onPlayNext(track.trackId)
                }
                onAddToQueue={
                  onAddToQueue === undefined
                    ? undefined
                    : () => onAddToQueue(track.trackId)
                }
                onToggleLike={() => onToggleLike(track.trackId)}
              />
            ))
          )}
        </VStack>
        <ArtistAlbumsSection
          albums={albums}
          hasMore={hasMoreAlbums}
          onOpenAlbum={(releaseId) => onOpenAlbum?.(releaseId)}
          onViewAll={() => onViewAllAlbums?.()}
        />
        <VStack spacing="sm">
          <Text className="font-app-semibold text-lg text-text">Updates</Text>
          {updates.length === 0 ? (
            <CollectionEmptyState
              compact
              icon="megaphone"
              title="No updates yet"
              subtitle="Posts from this artist show up here."
            />
          ) : (
            updates.map((update) => (
              <ArtistUpdateCard
                key={update.postId}
                artistName={artist.name}
                whenLabel={formatAge(update.createdAt, now)}
                audienceLabel={
                  update.audience === "supporters" || update.locked
                    ? "Supporters only"
                    : "Public"
                }
                body={update.body}
                locked={update.locked}
                photoUrl={update.photoUrl}
                voiceDurationMs={update.voiceDurationMs}
                voicePeaks={update.voicePeaks}
                voiceProgress={
                  update.voiceUrl !== null &&
                  update.voiceUrl !== undefined &&
                  heldVoiceUrl === update.voiceUrl
                    ? heldVoiceRatio
                    : update.voiceUrl !== null &&
                        update.voiceUrl !== undefined &&
                        voiceActiveUrl === update.voiceUrl
                      ? voiceProgress
                      : 0
                }
                voicePlaying={
                  update.voiceUrl !== null &&
                  update.voiceUrl !== undefined &&
                  playingVoiceUrl === update.voiceUrl
                }
                canPlayVoice={
                  update.voiceUrl !== null && update.voiceUrl !== undefined
                }
                onToggleVoice={() => {
                  if (
                    update.voiceUrl !== null &&
                    update.voiceUrl !== undefined
                  ) {
                    onToggleVoice?.(update.voiceUrl);
                  }
                }}
                onSeekVoice={(ratio) => {
                  if (
                    update.voiceUrl !== null &&
                    update.voiceUrl !== undefined
                  ) {
                    onSeekVoice?.(update.voiceUrl, ratio);
                  }
                }}
                onSupport={onSupport}
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
