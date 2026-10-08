import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants";
import type { RecentSearchItem } from "@/hooks";

import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import SearchField from "./SearchField";
import SearchGenreTiles, { type SearchGenreTile } from "./SearchGenreTiles";
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
  genres: SearchGenreTile[] | null;
  onOpenGenre: (genre: string) => void;
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
  onOpenLocked?: (trackId: string) => void;
}

const SearchTabScreen: React.FC<SearchTabScreenProps> = ({
  draft,
  onChangeDraft,
  artists,
  tracks,
  isLoading,
  hasQuery,
  recent,
  genres,
  onOpenGenre,
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
  onOpenLocked,
}) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(false);
  const showingResults = hasQuery && draft.trim().length > 0;
  const overlay = active || showingResults;
  const hasResults = artists.length > 0 || tracks.length > 0;
  const showIdleEmpty =
    !overlay &&
    !hasQuery &&
    recent !== null &&
    recent.length === 0 &&
    genres !== null &&
    genres.length === 0;

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
        <SearchField
          draft={draft}
          overlay={overlay}
          onChangeDraft={onChangeDraft}
          onFocus={() => {
            setActive(true);
          }}
          onCancel={() => {
            setActive(false);
            onChangeDraft("");
          }}
        />
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
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => {
            Keyboard.dismiss();
          }}
          contentContainerStyle={{
            paddingBottom: 32,
            paddingHorizontal: 24,
            minHeight: height,
          }}
        >
          {showingResults && isLoading ? <SearchResultsSkeleton /> : null}

          {showingResults && !isLoading && !hasResults ? (
            <View>
              <CollectionEmptyState
                compact
                icon="search"
                title="No matches"
                subtitle="Try another artist or track name."
              />
            </View>
          ) : null}

          {!overlay ? (
            <SearchGenreTiles genres={genres} onOpen={onOpenGenre} />
          ) : null}

          {overlay && !showingResults && recent === null ? (
            <RecentSearchesSkeleton />
          ) : null}

          {overlay &&
          !showingResults &&
          recent !== null &&
          recent.length === 0 ? (
            <CollectionEmptyState
              compact
              icon="search"
              title="Find artists and tracks"
              subtitle="Profiles you open and tracks you play show up here."
            />
          ) : null}

          {overlay &&
          !showingResults &&
          recent !== null &&
          recent.length > 0 ? (
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

          {showingResults && !isLoading && hasResults ? (
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
                  onOpenLocked={
                    onOpenLocked === undefined
                      ? undefined
                      : () => onOpenLocked(track.trackId)
                  }
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
