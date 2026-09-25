import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable } from "react-native";

import { COLORS } from "@/constants";
import { formatDuration } from "@/utils";

import WaveformScrubber from "../../player/WaveformScrubber/WaveformScrubber";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

interface VoiceNoteChipProps {
  durationMs: number;
  isPlaying: boolean;
  canPlay: boolean;
  onToggle: () => void;
  peaks?: number[];
  progress?: number;
  onSeek?: (ratio: number) => void;
}

const VoiceNoteChip: React.FC<VoiceNoteChipProps> = ({
  durationMs,
  isPlaying,
  canPlay,
  onToggle,
  peaks = [],
  progress = 0,
  onSeek,
}) => {
  const label = isPlaying ? "Pause voice note" : "Play voice note";

  return (
    <VStack spacing="sm" className="rounded-2xl bg-page p-2.5">
      <HStack spacing="sm" align="center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !canPlay }}
          disabled={!canPlay}
          onPress={onToggle}
        >
          <HStack
            spacing="none"
            align="center"
            justify="center"
            className="h-8 w-8 rounded-full bg-primary"
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={12}
              color={COLORS.textOnPrimary}
            />
          </HStack>
        </Pressable>
        <Text className="text-xs font-medium text-text/50">
          {formatDuration(durationMs)}
        </Text>
      </HStack>
      <WaveformScrubber
        peaks={peaks}
        progress={progress}
        onSeek={(ratio) => {
          onSeek?.(ratio);
        }}
      />
    </VStack>
  );
};

export default VoiceNoteChip;
