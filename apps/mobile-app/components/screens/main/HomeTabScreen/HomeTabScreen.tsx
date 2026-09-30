import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";

import { COLORS } from "@/constants";
import { useTabScrollTopPad } from "@/hooks";
import { formatAge } from "@/utils";

import FeedReleaseCard from "../../../feed/FeedReleaseCard/FeedReleaseCard";
import FeedUpdateCard from "../../../feed/FeedUpdateCard/FeedUpdateCard";
import HomeFeedSkeleton from "../../../feed/HomeFeedSkeleton/HomeFeedSkeleton";
import AccountAvatarButton from "../../../ui/AccountAvatarButton/AccountAvatarButton";
import Button from "../../../ui/Button/Button";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export interface HomeFeedPost {
  kind: "post";
  id: string;
  artistId: string;
  artistName: string;
  avatarUrl: string | null;
  createdAt: number;
  audience: "everyone" | "supporters";
  body: string | null;
  locked: boolean;
  photoUrl: string | null;
  voiceDurationMs: number | null;
  voiceUrl: string | null;
  voicePeaks: number[];
}

export interface HomeFeedRelease {
  kind: "release";
  id: string;
  artistId: string;
  artistName: string;
  avatarUrl: string | null;
  createdAt: number;
  title: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  peaks: number[];
}

interface HomeTabScreenProps {
  displayName: string;
  items: (HomeFeedPost | HomeFeedRelease)[];
  isLoading: boolean;
  failed?: boolean;
  onRetry?: () => void;
  now: number;
  playingTrackId: string | null;
  playingVoiceUrl: string | null;
  voiceActiveUrl: string | null;
  voiceProgress: number;
  heldVoiceUrl?: string | null;
  heldVoiceRatio?: number;
  onOpenAccount: () => void;
  onOpenArtist: (artistId: string) => void;
  onPlayTrack: (trackId: string) => void;
  onToggleVoice: (url: string) => void;
  onSeekVoice: (url: string, ratio: number) => void;
  onSupport: (artistId: string) => void;
}

/**
 * ScrollView is the screen root so iOS 26 can minimize the tab bar and split
 * the mini-player on scroll. Fixed corner glow is deferred — same constraint
 * as Discover.
 * https://docs.expo.dev/versions/latest/sdk/router/native-tabs/
 */
const HomeTabScreen: React.FC<HomeTabScreenProps> = ({
  displayName,
  items,
  isLoading,
  failed = false,
  onRetry,
  now,
  playingTrackId,
  playingVoiceUrl,
  voiceActiveUrl,
  voiceProgress,
  heldVoiceUrl = null,
  heldVoiceRatio = 0,
  onOpenAccount,
  onOpenArtist,
  onPlayTrack,
  onToggleVoice,
  onSeekVoice,
  onSupport,
}) => {
  const { height } = useWindowDimensions();
  const paddingTop = useTabScrollTopPad();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingTop,
        paddingBottom: 32,
        paddingHorizontal: 24,
        minHeight: height + 120,
      }}
    >
      <HStack spacing="md" align="center" justify="between">
        <Text className="font-display-bold text-3xl text-text">Home</Text>
        <AccountAvatarButton
          displayName={displayName}
          onPress={onOpenAccount}
        />
      </HStack>
      <VStack spacing="md" className="pt-4">
        <Text className="font-app-semibold text-lg text-text">Updates</Text>
        {failed ? (
          <View className="mt-6 items-center rounded-2xl bg-surface px-6 py-6">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="warning" size={22} color={COLORS.primary} />
            </View>
            <Text className="text-center font-app-semibold text-base text-text">
              {"Couldn't load updates"}
            </Text>
            <Text className="mt-1 max-w-[240px] text-center text-sm text-text/45">
              Check your connection and try again.
            </Text>
            <View className="mt-4">
              <Button text="Try again" onPress={onRetry} />
            </View>
          </View>
        ) : null}
        {!failed && isLoading ? <HomeFeedSkeleton /> : null}
        {!failed && !isLoading && items.length === 0 ? (
          <CollectionEmptyState
            compact
            icon="megaphone"
            title="No updates yet"
            subtitle="Posts from artists you follow show up here."
          />
        ) : null}
        {!failed
          ? items.map((item) => {
              if (item.kind === "release") {
                return (
                  <FeedReleaseCard
                    key={item.id}
                    artistName={item.artistName}
                    avatarUrl={item.avatarUrl}
                    meta={`${formatAge(item.createdAt, now)} · New release`}
                    title={item.title}
                    artworkUrl={item.artworkUrl}
                    durationMs={item.durationMs}
                    locked={item.locked}
                    isPlaying={playingTrackId === item.id}
                    onOpenArtist={() => onOpenArtist(item.artistId)}
                    onPlay={() => onPlayTrack(item.id)}
                    onSupport={() => onSupport(item.artistId)}
                  />
                );
              }
              const meta =
                item.voiceDurationMs !== null
                  ? `${formatAge(item.createdAt, now)} · Voice note`
                  : `${formatAge(item.createdAt, now)} · ${
                      item.audience === "supporters" || item.locked
                        ? "Supporters only"
                        : "Public"
                    }`;
              return (
                <FeedUpdateCard
                  key={item.id}
                  artistName={item.artistName}
                  avatarUrl={item.avatarUrl}
                  meta={meta}
                  body={item.body}
                  locked={item.locked}
                  photoUrl={item.photoUrl}
                  voiceDurationMs={item.voiceDurationMs}
                  canPlayVoice={item.voiceUrl !== null}
                  voicePlaying={
                    item.voiceUrl !== null && playingVoiceUrl === item.voiceUrl
                  }
                  voicePeaks={item.voicePeaks}
                  voiceProgress={
                    item.voiceUrl !== null && heldVoiceUrl === item.voiceUrl
                      ? heldVoiceRatio
                      : item.voiceUrl !== null &&
                          voiceActiveUrl === item.voiceUrl
                        ? voiceProgress
                        : 0
                  }
                  onOpenArtist={() => onOpenArtist(item.artistId)}
                  onSupport={() => onSupport(item.artistId)}
                  onToggleVoice={() => {
                    if (item.voiceUrl !== null) {
                      onToggleVoice(item.voiceUrl);
                    }
                  }}
                  onSeekVoice={(ratio) => {
                    if (item.voiceUrl !== null) {
                      onSeekVoice(item.voiceUrl, ratio);
                    }
                  }}
                />
              );
            })
          : null}
      </VStack>
    </ScrollView>
  );
};

export default HomeTabScreen;
