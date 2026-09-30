import {
  type BottomSheetMethods,
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";
import { STAND_IN_TRACK_ID } from "@/hooks";
import { showLikedToast } from "@/utils";

import AddToPlaylistSheet from "../../bottom-sheets/AddToPlaylistSheet/AddToPlaylistSheet";
import CoverImage from "../../ui/CoverImage/CoverImage";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface TrackMenuProps {
  title: string;
  artistName?: string;
  trackId: string;
  artworkUrl?: string | null;
  liked?: boolean;
  onPlayNext?: () => void;
  onAddToQueue?: () => void;
  onToggleLike?: () => void;
  onRemove?: () => void;
  filled?: boolean;
  /** Locked tracks stay in the list. The menu does not open. */
  disabled?: boolean;
}

interface MenuRow {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress: () => void;
}

/**
 * Track options open as a sheet on both platforms, matching the now-playing
 * design: grabber, cover, title, then the actions.
 * https://docs.expo.dev/versions/v57.0.0/sdk/ui/bottom-sheet/
 */
const TrackMenu: React.FC<TrackMenuProps> = ({
  title,
  artistName,
  trackId,
  artworkUrl,
  liked = false,
  onPlayNext,
  onAddToQueue,
  onToggleLike,
  onRemove,
  filled = false,
  disabled = false,
}) => {
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const realTrack = trackId !== STAND_IN_TRACK_ID;
  const rows: MenuRow[] = [];

  if (onPlayNext) {
    rows.push({
      id: "play-next",
      label: "Play next",
      icon: "play-skip-forward",
      onPress: onPlayNext,
    });
  }
  if (onAddToQueue) {
    rows.push({
      id: "add-queue",
      label: "Add to queue",
      icon: "list",
      onPress: onAddToQueue,
    });
  }
  if (onToggleLike && realTrack) {
    rows.push({
      id: "like",
      label: liked ? `Unlike ${title}` : `Like ${title}`,
      icon: liked ? "heart" : "heart-outline",
      color: liked ? COLORS.primary : COLORS.text,
      onPress: () => {
        onToggleLike();
        showLikedToast(!liked);
      },
    });
  }
  if (realTrack) {
    rows.push({
      id: "add-playlist",
      label: "Add to playlist",
      icon: "add",
      onPress: () => setPlaylistOpen(true),
    });
  }
  if (onRemove) {
    rows.push({
      id: "remove",
      label: `Delete ${title}`,
      icon: "trash-outline",
      color: COLORS.danger,
      onPress: onRemove,
    });
  }

  if (disabled || rows.length === 0) {
    if (!disabled) {
      return null;
    }
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`More options for ${title}`}
        accessibilityState={{ disabled: true }}
        disabled
        className={
          filled
            ? "h-11 w-11 items-center justify-center rounded-full bg-surface"
            : "h-11 w-11 items-center justify-center"
        }
        style={{ opacity: 0.35 }}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
      </Pressable>
    );
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`More options for ${title}`}
        onPress={() => sheetRef.current?.present()}
        className={
          filled
            ? "h-11 w-11 items-center justify-center rounded-full bg-surface"
            : "h-11 w-11 items-center justify-center"
        }
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
      </Pressable>
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: COLORS.surface }}
      >
        <BottomSheetView>
          <HStack
            spacing="md"
            align="center"
            className="mx-5 border-b border-white/10 px-1 pb-4"
          >
            <CoverImage uri={artworkUrl} width={48} height={48} radius={8} />
            <VStack spacing="none" className="min-w-0 flex-1">
              <Text
                className="font-app-semibold text-sm text-text"
                numberOfLines={1}
              >
                {title}
              </Text>
              {artistName ? (
                <Text className="text-xs text-text/50" numberOfLines={1}>
                  {artistName}
                </Text>
              ) : null}
            </VStack>
          </HStack>
          <VStack spacing="none" className="px-3 pb-8 pt-2">
            {rows.map((row) => (
              <Pressable
                key={row.id}
                accessibilityRole="button"
                accessibilityLabel={row.label}
                onPress={() => {
                  sheetRef.current?.dismiss();
                  row.onPress();
                }}
                className="flex-row items-center gap-4 rounded-2xl px-3 py-3.5"
              >
                <Ionicons
                  name={row.icon}
                  size={18}
                  color={row.color ?? COLORS.text}
                />
                <Text
                  className="font-app-medium text-[15px] text-text"
                  style={row.color ? { color: row.color } : undefined}
                >
                  {row.label}
                </Text>
              </Pressable>
            ))}
          </VStack>
        </BottomSheetView>
      </BottomSheetModal>
      {playlistOpen ? (
        <AddToPlaylistSheet
          trackId={trackId}
          open
          onClose={() => setPlaylistOpen(false)}
        />
      ) : null}
    </>
  );
};

export default TrackMenu;
