import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  type BottomSheetMethods,
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";

import { COLORS } from "@/constants";
import { getConvexErrorMessage, showPlaylistAddedToast } from "@/utils";

import PlaylistCover from "../../library/PlaylistCover/PlaylistCover";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import TextField from "../../ui/TextField/TextField";

interface AddToPlaylistSheetProps {
  trackId: string;
  open: boolean;
  onClose: () => void;
}

const AddToPlaylistSheet: React.FC<AddToPlaylistSheetProps> = ({
  trackId,
  open,
  onClose,
}) => {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const playlists = useQuery(api.library.listPlaylists, open ? {} : "skip");
  const createPlaylist = useMutation(api.library.createPlaylist);
  const addTrack = useMutation(api.library.addTrack);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
      return;
    }
    sheetRef.current?.dismiss();
  }, [open]);

  const requestClose = () => {
    sheetRef.current?.dismiss();
  };

  const finish = () => {
    setCreating(false);
    setName("");
    onClose();
  };

  const addTo = async (playlistId: Id<"playlists">, playlistName: string) => {
    setSaving(true);
    try {
      await addTrack({
        playlistId,
        trackId: trackId as Id<"tracks">,
      });
      showPlaylistAddedToast(playlistName);
      requestClose();
    } catch (error) {
      Alert.alert(
        "Couldn't add this track",
        getConvexErrorMessage(error, "Try again in a moment.")
      );
    } finally {
      setSaving(false);
    }
  };

  const createAndAdd = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0 || saving) {
      return;
    }
    setSaving(true);
    try {
      const playlistId = await createPlaylist({ name: trimmed });
      await addTrack({
        playlistId,
        trackId: trackId as Id<"tracks">,
      });
      showPlaylistAddedToast(trimmed);
      requestClose();
    } catch (error) {
      Alert.alert(
        "Couldn't create the playlist",
        getConvexErrorMessage(error, "Enter a name and try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["70%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={finish}
      backgroundStyle={{ backgroundColor: COLORS.page }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <HStack align="center" justify="between" className="px-6 pb-4 pt-2">
          <Text className="font-display-bold text-lg text-text">
            Add to playlist
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close playlists"
            onPress={requestClose}
            className="h-9 w-9 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="close" size={16} color={COLORS.text} />
          </Pressable>
        </HStack>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        >
          <VStack spacing="sm">
            {creating ? (
              <VStack spacing="sm">
                <TextField
                  label="Playlist name"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Create playlist"
                  disabled={saving}
                  onPress={() => {
                    void createAndAdd();
                  }}
                >
                  <VStack
                    spacing="none"
                    align="center"
                    justify="center"
                    className="rounded-full bg-primary py-3.5"
                  >
                    <Text className="font-app-semibold text-sm text-textOnPrimary">
                      Create and add
                    </Text>
                  </VStack>
                </Pressable>
              </VStack>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="New playlist"
                onPress={() => setCreating(true)}
              >
                <HStack
                  spacing="md"
                  align="center"
                  className="rounded-2xl bg-surface p-3"
                >
                  <HStack
                    spacing="none"
                    align="center"
                    justify="center"
                    className="h-12 w-12 rounded-xl bg-page"
                  >
                    <Ionicons name="add" size={22} color={COLORS.primary} />
                  </HStack>
                  <Text className="font-app-semibold text-sm text-text">
                    New playlist
                  </Text>
                </HStack>
              </Pressable>
            )}
            {(playlists ?? []).map((playlist) => (
              <Pressable
                key={playlist.playlistId}
                accessibilityRole="button"
                accessibilityLabel={playlist.name}
                disabled={saving}
                onPress={() => {
                  void addTo(playlist.playlistId, playlist.name);
                }}
              >
                <HStack
                  spacing="md"
                  align="center"
                  className="rounded-2xl bg-surface p-3"
                >
                  <PlaylistCover urls={playlist.artworkUrls} />
                  <VStack spacing="none" className="min-w-0 flex-1">
                    <Text
                      className="font-app-semibold text-sm text-text"
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
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default AddToPlaylistSheet;
