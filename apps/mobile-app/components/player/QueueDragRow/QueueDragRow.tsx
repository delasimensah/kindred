import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, TouchableOpacity } from "react-native";
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
  active?: boolean;
  onPlay: () => void;
  onRemove: () => void;
}

const QueueDragRow: React.FC<QueueDragRowProps> = ({
  track,
  drag,
  active = false,
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

  return (
    <HStack
      align="center"
      spacing="sm"
      className="rounded-2xl px-1 py-2.5"
      style={
        track.locked
          ? { opacity: 0.45 }
          : active
            ? {
                backgroundColor: COLORS.surface,
                shadowColor: COLORS.black,
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
              }
            : undefined
      }
    >
      {track.locked ? (
        <Ionicons name="lock-closed" size={16} color={COLORS.text} />
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={track.title}
          accessibilityHint="Hold to reorder"
          accessibilityState={{ selected: active }}
          onPress={onPlay}
          onLongPress={pickUp}
          delayLongPress={180}
          disabled={active}
          className="min-w-0 flex-1"
        >
          <HStack align="center" spacing="sm" className="min-w-0 flex-1">
            <Ionicons
              name="reorder-three"
              size={26}
              color={active ? COLORS.primary : COLORS.text}
              style={{
                width: 32,
                opacity: active ? 1 : TEXT_SECONDARY_OPACITY,
              }}
            />
            <QueueArtwork url={track.artworkUrl} size={52} />
            <TrackCopy title={track.title} artistName={track.artistName} />
          </HStack>
        </TouchableOpacity>
      )}
      {track.locked ? (
        <>
          <QueueArtwork url={track.artworkUrl} size={52} dimmed />
          <TrackCopy title={track.title} artistName={track.artistName} />
          <Text
            className="font-app-semibold text-xs uppercase tracking-wide"
            style={{ color: COLORS.text, opacity: TEXT_SECONDARY_OPACITY }}
          >
            Skipped
          </Text>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${track.title}`}
          onPress={() => confirmRemove(track.title, onRemove)}
          className="h-11 w-11 items-center justify-center"
        >
          <Ionicons
            name="close"
            size={22}
            color={COLORS.text}
            style={{ opacity: TEXT_SECONDARY_OPACITY }}
          />
        </Pressable>
      )}
    </HStack>
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
