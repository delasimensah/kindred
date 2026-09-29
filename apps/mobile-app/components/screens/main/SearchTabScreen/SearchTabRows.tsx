import { Ionicons } from "@expo/vector-icons";
import { Pressable, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";

import TrackMenu from "../../../catalog/TrackMenu/TrackMenu";
import CoverImage from "../../../ui/CoverImage/CoverImage";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import type { SearchArtistResult, SearchTrackResult } from "./SearchTabScreen";

export function SearchArtistRow({
  artist,
  onOpen,
  onToggleFollow,
}: {
  artist: SearchArtistResult;
  onOpen: () => void;
  onToggleFollow: () => void;
}) {
  const followLabel = artist.isFollowed
    ? `Following ${artist.name}`
    : `Follow ${artist.name}`;

  return (
    <HStack spacing="sm" align="center" className="rounded-2xl bg-surface p-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${artist.name}`}
        onPress={onOpen}
        style={{ flex: 1, minWidth: 0 }}
      >
        <HStack spacing="sm" align="center">
          <PersonAvatar
            displayName={artist.name}
            imageUrl={artist.avatarUrl}
            size={56}
          />
          <VStack spacing="none" className="min-w-0 flex-1">
            <Text
              className="font-app-semibold text-[15px] text-text"
              numberOfLines={1}
            >
              {artist.name}
            </Text>
            <Text className="text-xs text-text/50" numberOfLines={1}>
              {artist.detail}
            </Text>
          </VStack>
        </HStack>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={followLabel}
        onPress={onToggleFollow}
        className={
          artist.isFollowed
            ? "rounded-full bg-primary px-4 py-2"
            : "rounded-full border border-text/20 px-4 py-2"
        }
      >
        <Text
          className={
            artist.isFollowed
              ? "font-app-semibold text-xs text-textOnPrimary"
              : "font-app-semibold text-xs text-primary"
          }
        >
          {artist.isFollowed ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </HStack>
  );
}

export function SearchTrackRow({
  track,
  isPlaying,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
}: {
  track: SearchTrackResult;
  isPlaying: boolean;
  onPlay: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
  onToggleLike: () => void;
}) {
  const playing = isPlaying && !track.locked;
  const label = track.locked
    ? `${track.title}, supporters only`
    : playing
      ? `Pause ${track.title}`
      : `Play ${track.title}`;

  return (
    <HStack spacing="sm" align="center" className="rounded-2xl bg-surface p-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: track.locked }}
        disabled={track.locked}
        onPress={onPlay}
        style={{ flex: 1, minWidth: 0 }}
      >
        <HStack spacing="sm" align="center">
          <VStack
            spacing="none"
            align="center"
            justify="center"
            className="h-12 w-12 overflow-hidden rounded-xl"
          >
            <CoverImage
              uri={track.artworkUrl}
              width={48}
              height={48}
              radius={12}
              opacity={track.locked ? 0.45 : 1}
              style={{ position: "absolute" }}
            />
            {track.locked ? (
              <Ionicons name="lock-closed" size={14} color={COLORS.primary} />
            ) : null}
          </VStack>
          <VStack spacing="none" className="min-w-0 flex-1">
            <Text
              className={
                playing
                  ? "font-app-medium text-sm text-primary"
                  : track.locked
                    ? "font-app-medium text-sm text-text/50"
                    : "font-app-medium text-sm text-text"
              }
              numberOfLines={1}
            >
              {track.title}
            </Text>
            <Text className="mt-0.5 text-xs text-text/50" numberOfLines={1}>
              {track.artistName} · Track
            </Text>
          </VStack>
          {track.locked ? null : (
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Ionicons
                name={playing ? "pause" : "play"}
                size={14}
                color={COLORS.textOnPrimary}
                style={playing ? undefined : { marginLeft: 2 }}
              />
            </View>
          )}
        </HStack>
      </Pressable>
      <TrackMenu
        title={track.title}
        trackId={track.trackId}
        artworkUrl={track.artworkUrl}
        liked={track.liked}
        onPlayNext={onPlayNext}
        onAddToQueue={onAddToQueue}
        onToggleLike={onToggleLike}
        disabled={track.locked}
      />
    </HStack>
  );
}

export function SearchResultsSkeleton() {
  const { width } = useWindowDimensions();
  const artistText = Math.max(96, width - 48 - 24 - 56 - 88 - 32);
  const trackText = Math.max(96, width - 48 - 24 - 48 - 36 - 44 - 40);

  return (
    <VStack spacing="sm" className="mt-6" testID="search-skeleton">
      <SkeletonCard width={88} height={12} radius={4} />
      <HStack
        spacing="sm"
        align="center"
        className="rounded-2xl bg-surface p-3"
      >
        <SkeletonCard width={56} height={56} radius={28} tone="page" />
        <VStack spacing="xs" className="min-w-0 flex-1">
          <SkeletonCard
            width={artistText * 0.62}
            height={15}
            radius={4}
            tone="page"
          />
          <SkeletonCard
            width={artistText * 0.44}
            height={12}
            radius={4}
            tone="page"
          />
        </VStack>
        <SkeletonCard width={76} height={32} radius={16} tone="page" />
      </HStack>
      {[0.72, 0.48, 0.6].map((titleShare) => (
        <HStack
          key={titleShare}
          spacing="sm"
          align="center"
          className="rounded-2xl bg-surface p-3"
        >
          <SkeletonCard width={48} height={48} radius={12} tone="page" />
          <VStack spacing="xs" className="min-w-0 flex-1">
            <SkeletonCard
              width={trackText * titleShare}
              height={14}
              radius={4}
              tone="page"
            />
            <SkeletonCard
              width={trackText * 0.38}
              height={12}
              radius={4}
              tone="page"
            />
          </VStack>
          <SkeletonCard width={36} height={36} radius={18} tone="page" />
          <HStack
            spacing="none"
            align="center"
            justify="center"
            className="h-11 w-11"
          >
            <SkeletonCard width={20} height={4} radius={2} tone="page" />
          </HStack>
        </HStack>
      ))}
    </VStack>
  );
}
