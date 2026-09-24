import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import Swipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { COLORS } from "@/constants";
import { useAppInsets } from "@/hooks";

import PlaylistCover from "../../../library/PlaylistCover/PlaylistCover";
import CollectionEmptyState from "../../../ui/CollectionEmptyState/CollectionEmptyState";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import PlaylistListScreenSkeleton from "./PlaylistListScreenSkeleton";

export interface PlaylistSummary {
  playlistId: string;
  name: string;
  trackCount: number;
  artworkUrls: string[];
}

interface PlaylistListScreenProps {
  playlists: PlaylistSummary[];
  isLoading: boolean;
  onCreate: () => void;
  onOpen: (playlistId: string) => void;
  onDelete: (playlistId: string) => void;
}

const PlaylistListScreen: React.FC<PlaylistListScreenProps> = ({
  playlists,
  isLoading,
  onCreate,
  onOpen,
  onDelete,
}) => {
  const insets = useAppInsets();

  return (
    <ScrollView
      className="flex-1 bg-page"
      style={{ flex: 1, backgroundColor: COLORS.page }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      <VStack spacing="md" padding="lg">
        {!isLoading && playlists.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create playlist"
            onPress={onCreate}
          >
            <VStack
              spacing="none"
              align="center"
              justify="center"
              className="rounded-full bg-primary py-3.5"
            >
              <Text className="font-app-semibold text-sm text-textOnPrimary">
                Create playlist
              </Text>
            </VStack>
          </Pressable>
        ) : null}
        {isLoading ? (
          <PlaylistListScreenSkeleton />
        ) : playlists.length === 0 ? (
          <CollectionEmptyState
            icon="disc"
            title="No playlists yet"
            subtitle="Start collecting the tracks you love into a playlist of your own."
            actionLabel="Create playlist"
            onAction={onCreate}
          />
        ) : (
          <>
            <Text className="text-xs uppercase tracking-wide text-text/40">
              {playlists.length === 1
                ? "1 playlist"
                : `${playlists.length} playlists`}
            </Text>
            {playlists.map((playlist) => (
              <SwipeablePlaylistRow
                key={playlist.playlistId}
                playlist={playlist}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </>
        )}
      </VStack>
    </ScrollView>
  );
};

const SwipeablePlaylistRow: React.FC<{
  playlist: PlaylistSummary;
  onOpen: (playlistId: string) => void;
  onDelete: (playlistId: string) => void;
}> = ({ playlist, onOpen, onDelete }) => {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const confirming = useRef(false);

  const askDelete = () => {
    if (confirming.current) {
      return;
    }
    confirming.current = true;
    Alert.alert(
      "Delete playlist",
      `Are you sure you want to delete ${playlist.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            confirming.current = false;
            swipeableRef.current?.close();
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            confirming.current = false;
            onDelete(playlist.playlistId);
          },
        },
      ]
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${playlist.name}`}
          onPress={askDelete}
        >
          <VStack
            spacing="none"
            align="center"
            justify="center"
            className="h-full w-24 bg-danger"
          >
            <Text className="font-app-semibold text-sm text-white">Delete</Text>
          </VStack>
        </Pressable>
      )}
      onSwipeableOpen={(direction) => {
        if (direction === "right") {
          askDelete();
        }
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playlist.name}
        onPress={() => onOpen(playlist.playlistId)}
      >
        <HStack
          spacing="md"
          align="center"
          className="rounded-2xl bg-surface p-3"
        >
          <PlaylistCover urls={playlist.artworkUrls} />
          <VStack spacing="none" className="min-w-0 flex-1">
            <Text
              className="font-app-semibold text-[15px] text-text"
              numberOfLines={1}
            >
              {playlist.name}
            </Text>
            <Text className="mt-1 text-xs text-text/40">
              {playlist.trackCount === 1
                ? "1 track"
                : `${playlist.trackCount} tracks`}
            </Text>
          </VStack>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.text}
            style={{ opacity: 0.3 }}
          />
        </HStack>
      </Pressable>
    </Swipeable>
  );
};

export default PlaylistListScreen;
