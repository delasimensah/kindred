import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, FONTS } from "@/constants";
import type { RecentSearchItem } from "@/hooks";

import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import { RecentSearchesSkeleton, RecentSearchRow } from "./SearchRecentRows";
import {
  SearchArtistRow,
  SearchResultsSkeleton,
  SearchTrackRow,
} from "./SearchTabRows";

export interface SearchArtistResult {
  artistId: string;
  name: string;
  detail: string;
  avatarUrl: string | null;
  isFollowed: boolean;
}

export interface SearchTrackResult {
  trackId: string;
  artistId: string;
  title: string;
  artistName: string;
  artworkUrl: string | null;
  durationMs: number;
  locked: boolean;
  liked: boolean;
}

interface SearchTabScreenProps {
  draft: string;
  onChangeDraft: (value: string) => void;
  artists: SearchArtistResult[];
  tracks: SearchTrackResult[];
  isLoading: boolean;
  hasQuery: boolean;
  recent: RecentSearchItem[] | null;
  onOpenRecentArtist: (artistId: string) => void;
  onPlayRecentTrack: (trackId: string) => void;
  onForgetRecent: (item: RecentSearchItem) => void;
  onClearRecent: () => void;
  playingTrackId: string | null;
  isPlaying: boolean;
  onToggleFollow: (artistId: string) => void;
  onOpenArtist: (artistId: string) => void;
  onPlay: (trackId: string) => void;
  onPlayNext: (trackId: string) => void;
  onAddToQueue: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
}

const SearchTabScreen: React.FC<SearchTabScreenProps> = ({
  draft,
  onChangeDraft,
  artists,
  tracks,
  isLoading,
  hasQuery,
  recent,
  onOpenRecentArtist,
  onPlayRecentTrack,
  onForgetRecent,
  onClearRecent,
  playingTrackId,
  isPlaying,
  onToggleFollow,
  onOpenArtist,
  onPlay,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
}) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const hasResults = artists.length > 0 || tracks.length > 0;
  const showIdleEmpty = !hasQuery && recent !== null && recent.length === 0;

  return (
    <View
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
    >
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 24,
          paddingHorizontal: 24,
          backgroundColor: COLORS.page,
        }}
      >
        <Text className="font-display-bold text-3xl text-text">Search</Text>
        <HStack
          spacing="sm"
          align="center"
          className="mt-4 rounded-full border border-white/10 bg-surface px-4"
          style={{ height: 48 }}
        >
          <Ionicons name="search" size={16} color={`${COLORS.text}66`} />
          <TextInput
            accessibilityLabel="Search artists and tracks"
            placeholder="Artists and tracks"
            placeholderTextColor={`${COLORS.text}59`}
            value={draft}
            onChangeText={onChangeDraft}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="flex-1 text-[15px] text-text"
            style={{
              flex: 1,
              fontFamily: FONTS.regular,
              fontSize: 15,
              paddingVertical: 0,
              color: COLORS.text,
            }}
          />
          {draft.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => {
                onChangeDraft("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={`${COLORS.text}66`}
              />
            </Pressable>
          ) : null}
        </HStack>
      </View>

      {showIdleEmpty ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <CollectionEmptyState
            compact
            icon="search"
            title="Find artists and tracks"
            subtitle="Profiles you open and tracks you play show up here."
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-page"
          style={{ flex: 1, backgroundColor: COLORS.page }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 32,
            paddingHorizontal: 24,
            minHeight: height,
          }}
        >
          {isLoading ? <SearchResultsSkeleton /> : null}

          {!isLoading && hasQuery && !hasResults ? (
            <View>
              <CollectionEmptyState
                compact
                icon="search"
                title="No matches"
                subtitle="Try another artist or track name."
              />
            </View>
          ) : null}

          {!hasQuery && recent === null ? <RecentSearchesSkeleton /> : null}

          {!hasQuery && recent !== null && recent.length > 0 ? (
            <VStack spacing="sm">
              <HStack spacing="sm" align="center" justify="between">
                <Text className="font-app-semibold text-xs uppercase tracking-wide text-text/50">
                  Recent
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear recent searches"
                  onPress={onClearRecent}
                >
                  <Text className="font-app-semibold text-xs text-primary">
                    Clear
                  </Text>
                </Pressable>
              </HStack>
              {recent.map((item) => (
                <RecentSearchRow
                  key={
                    item.kind === "artist"
                      ? `artist:${item.artistId}`
                      : `track:${item.trackId}`
                  }
                  item={item}
                  isPlaying={
                    item.kind === "track" &&
                    isPlaying &&
                    playingTrackId === item.trackId
                  }
                  onOpen={() => {
                    if (item.kind === "artist") {
                      onOpenRecentArtist(item.artistId);
                      return;
                    }
                    onPlayRecentTrack(item.trackId);
                  }}
                  onForget={() => {
                    onForgetRecent(item);
                  }}
                />
              ))}
            </VStack>
          ) : null}

          {!isLoading && hasResults ? (
            <VStack spacing="sm" style={{ gap: 12 }}>
              <Text className="font-app-semibold text-xs uppercase tracking-wide text-text/50">
                Top results
              </Text>
              {artists.map((artist) => (
                <SearchArtistRow
                  key={artist.artistId}
                  artist={artist}
                  onOpen={() => {
                    onOpenArtist(artist.artistId);
                  }}
                  onToggleFollow={() => {
                    onToggleFollow(artist.artistId);
                  }}
                />
              ))}
              {tracks.map((track) => (
                <SearchTrackRow
                  key={track.trackId}
                  track={track}
                  isPlaying={isPlaying && playingTrackId === track.trackId}
                  onPlay={() => {
                    onPlay(track.trackId);
                  }}
                  onPlayNext={() => {
                    onPlayNext(track.trackId);
                  }}
                  onAddToQueue={() => {
                    onAddToQueue(track.trackId);
                  }}
                  onToggleLike={() => {
                    onToggleLike(track.trackId);
                  }}
                />
              ))}
            </VStack>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
};

export default SearchTabScreen;
