import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, View } from "react-native";
import { TEXT_SECONDARY_OPACITY } from "shared";

import { COLORS } from "@/constants";
import type { QueueTrack } from "@/hooks";
import { tapHaptic } from "@/utils";

import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";
import QueueArtwork from "../QueueArtwork/QueueArtwork";

interface QueueDragRowProps {
  track: QueueTrack;
  drag?: () => void;
  onPlay: () => void;
  onRemove: () => void;
}

/**
 * Same split as Aria’s QueueItem: tap the track to play, long-press only the
 * handle to reorder — so a vertical swipe on the row closes the sheet / scrolls.
 */
const QueueDragRow: React.FC<QueueDragRowProps> = ({
  track,
  drag,
  onPlay,
  onRemove,
}) => {
  const pickUp = () => {
    if (drag === undefined) {
      return;
    }
    void tapHaptic("select");
    drag();
  };

  if (track.locked) {
    return (
      <HStack
        align="center"
        spacing="sm"
        className="mb-1 rounded-2xl px-1 py-2.5"
        style={{ opacity: 0.45 }}
      >
        <Ionicons name="lock-closed" size={16} color={COLORS.text} />
        <QueueArtwork url={track.artworkUrl} size={52} dimmed />
        <TrackCopy title={track.title} artistName={track.artistName} />
        <Text
          className="font-app-semibold text-xs uppercase tracking-wide"
          style={{ color: COLORS.text, opacity: TEXT_SECONDARY_OPACITY }}
        >
          Skipped
        </Text>
      </HStack>
    );
  }

  return (
    <View className="mb-1 flex-row items-center px-1 py-2.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={track.title}
        onPress={onPlay}
        className="min-w-0 flex-1 flex-row items-center"
      >
        <QueueArtwork url={track.artworkUrl} size={52} />
        <View className="ml-3 min-w-0 flex-1">
          <TrackCopy title={track.title} artistName={track.artistName} />
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${track.title}`}
        onPress={() => confirmRemove(track.title, onRemove)}
        hitSlop={8}
        className="h-11 w-11 items-center justify-center"
      >
        <Ionicons
          name="close"
          size={22}
          color={COLORS.text}
          style={{ opacity: TEXT_SECONDARY_OPACITY }}
        />
      </Pressable>

      {drag ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reorder ${track.title}`}
          accessibilityHint="Hold to reorder"
          onLongPress={pickUp}
          delayLongPress={100}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
        >
          <Ionicons
            name="menu"
            size={24}
            color={COLORS.text}
            style={{ opacity: TEXT_SECONDARY_OPACITY }}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

function TrackCopy({
  title,
  artistName,
}: {
  title: string;
  artistName: string;
}) {
  return (
    <VStack spacing="none" className="min-w-0 flex-1">
      <Text
        className="font-app-medium text-base"
        style={{ color: COLORS.text }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        className="mt-0.5 text-sm"
        style={{ color: COLORS.text, opacity: TEXT_SECONDARY_OPACITY }}
        numberOfLines={1}
      >
        {artistName}
      </Text>
    </VStack>
  );
}

function confirmRemove(title: string, onRemove: () => void) {
  Alert.alert("Remove from queue", `Remove ${title} from the queue?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Remove", style: "destructive", onPress: onRemove },
  ]);
}

export default QueueDragRow;
