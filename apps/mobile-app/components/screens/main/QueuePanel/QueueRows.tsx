import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { COLORS } from "@/constants";
import type { QueueTrack } from "@/hooks";

import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export function NowPlayingRow({
  track,
  isPlaying,
}: {
  track: QueueTrack;
  isPlaying: boolean;
}) {
  return (
    <HStack
      align="center"
      spacing="sm"
      className="rounded-2xl bg-surface p-2.5"
      style={{ borderWidth: 1, borderColor: "rgba(255,211,105,0.25)" }}
    >
      <Artwork url={track.artworkUrl} size={48} />
      <VStack spacing="none" className="min-w-0 flex-1">
        <Text className="font-app-semibold text-sm text-text" numberOfLines={1}>
          {track.title}
        </Text>
        <Text className="mt-0.5 text-xs text-text/50" numberOfLines={1}>
          {track.artistName}
        </Text>
      </VStack>
      {isPlaying ? <PlayingBars /> : null}
    </HStack>
  );
}

export function QueueDragRow({
  track,
  drag,
  onRemove,
}: {
  track: QueueTrack;
  drag?: () => void;
  onRemove: () => void;
}) {
  return (
    <HStack
      align="center"
      spacing="sm"
      className="rounded-xl px-1 py-2"
      style={track.locked ? { opacity: 0.45 } : undefined}
    >
      {track.locked ? (
        <Ionicons name="lock-closed" size={12} color={COLORS.text} />
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Reorder ${track.title}`}
          onLongPress={drag}
          delayLongPress={150}
          style={{
            width: 32,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="reorder-three"
            size={18}
            color="rgba(238,238,238,0.25)"
          />
        </TouchableOpacity>
      )}
      <Artwork url={track.artworkUrl} size={44} dimmed={track.locked} />
      <VStack spacing="none" className="min-w-0 flex-1">
        <Text className="font-app-medium text-sm text-text" numberOfLines={1}>
          {track.title}
        </Text>
        <Text className="mt-0.5 text-xs text-text/45" numberOfLines={1}>
          {track.artistName}
        </Text>
      </VStack>
      {track.locked ? (
        <Text className="font-app-semibold text-[10px] uppercase tracking-wide text-text/40">
          Skipped
        </Text>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${track.title}`}
          onPress={onRemove}
          className="h-8 w-8 items-center justify-center"
        >
          <Ionicons name="close" size={16} color="rgba(238,238,238,0.4)" />
        </Pressable>
      )}
    </HStack>
  );
}

function Artwork({
  url,
  size,
  dimmed = false,
}: {
  url: string | null;
  size: number;
  dimmed?: boolean;
}) {
  if (!url) {
    return (
      <VStack
        spacing="none"
        className="rounded-lg bg-page"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <Image
      source={{ uri: url }}
      contentFit="cover"
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        opacity: dimmed ? 0.7 : 1,
      }}
    />
  );
}

function PlayingBars() {
  const heights = [8, 16, 12, 20];
  return (
    <HStack align="center" spacing="none" className="mr-1 h-5 gap-[3px]">
      {heights.map((height) => (
        <VStack
          key={height}
          spacing="none"
          className="w-[3px] rounded-sm bg-primary"
          style={{ height }}
        />
      ))}
    </HStack>
  );
}
