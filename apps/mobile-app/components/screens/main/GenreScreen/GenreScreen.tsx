import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import PersonAvatar from "../../../ui/PersonAvatar/PersonAvatar";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import Text from "../../../ui/Text/Text";

export interface GenreArtist {
  artistId: string;
  name: string;
  avatarUrl: string | null;
}

export interface GenreTrack {
  trackId: string;
  title: string;
  artistId: string;
  artistName: string;
  artworkUrl: string | null;
  durationMs: number;
}

interface GenreScreenProps {
  artists: GenreArtist[];
  tracks: GenreTrack[];
  isLoading: boolean;
  playingTrackId: string | null;
  isPlaying: boolean;
  onOpenArtist: (artistId: string) => void;
  onPlay: (trackId: string) => void;
}

const GenreScreen: React.FC<GenreScreenProps> = ({
  artists,
  tracks,
  isLoading,
  playingTrackId,
  isPlaying,
  onOpenArtist,
  onPlay,
}) => {
  const insets = useAppInsets();

  if (!isLoading && artists.length === 0 && tracks.length === 0) {
    return (
      <View
        className="flex-1 bg-page"
        style={{ flex: 1, backgroundColor: COLORS.page }}
      >
        <CollectionEmptyState
          icon="musical-notes"
          title="Nothing in this genre yet"
          subtitle="Published tracks show up here."
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 24,
        paddingTop: 8,
      }}
    >
      <Text className="mb-3 font-app-semibold text-lg text-text">Artists</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -24, height: 100 }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
      >
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <SkeletonCard key={index} width={64} height={64} radius={32} />
            ))
          : artists.map((artist) => (
              <Pressable
                key={artist.artistId}
                accessibilityRole="button"
                accessibilityLabel={`Open ${artist.name}`}
                onPress={() => onOpenArtist(artist.artistId)}
                style={{ width: 72, alignItems: "center" }}
              >
                <PersonAvatar
                  displayName={artist.name}
                  imageUrl={artist.avatarUrl}
                  size={64}
                />
                <Text
                  className="mt-1.5 text-center text-xs text-text"
                  numberOfLines={1}
                >
                  {artist.name}
                </Text>
              </Pressable>
            ))}
      </ScrollView>

      <Text className="mb-2 mt-8 font-app-semibold text-lg text-text">
        Tracks
      </Text>
      {isLoading
        ? Array.from({ length: 4 }, (_, index) => (
            <View
              key={index}
              style={{ flexDirection: "row", gap: 12, paddingVertical: 10 }}
            >
              <SkeletonCard width={48} height={48} radius={8} />
              <SkeletonCard width={140} height={14} radius={4} />
            </View>
          ))
        : tracks.map((track) => {
            const playing = isPlaying && playingTrackId === track.trackId;
            return (
              <Pressable
                key={track.trackId}
                accessibilityRole="button"
                accessibilityLabel={`${playing ? "Pause" : "Play"} ${track.title}`}
                onPress={() => onPlay(track.trackId)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 8,
                }}
              >
                {track.artworkUrl !== null ? (
                  <Image
                    source={{ uri: track.artworkUrl }}
                    contentFit="cover"
                    style={{ width: 48, height: 48, borderRadius: 8 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: COLORS.surface,
                    }}
                  />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    className={`font-app-medium text-sm ${playing ? "text-primary" : "text-text"}`}
                    numberOfLines={1}
                  >
                    {track.title}
                  </Text>
                  <Text className="text-xs text-text/50" numberOfLines={1}>
                    {track.artistName}
                  </Text>
                </View>
                <Ionicons
                  name={playing ? "pause" : "play"}
                  size={18}
                  color={playing ? COLORS.primary : COLORS.text}
                />
              </Pressable>
            );
          })}
    </ScrollView>
  );
};

export default GenreScreen;
