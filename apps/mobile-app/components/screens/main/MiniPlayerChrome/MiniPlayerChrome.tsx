import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";

import { COLORS } from "@/constants";

import CoverImage from "../../../ui/CoverImage/CoverImage";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

export interface MiniPlayerTrack {
  title: string;
  artistName: string;
  artworkUrl?: string | null;
}

interface MiniPlayerChromeProps {
  /**
   * `regular` sits above the full tab bar.
   * `inline` is the gap the bar leaves when it splits.
   * Both use this same row. A shorter inline layout gets scaled into that
   * gap and the artwork and play button stop being square.
   */
  placement: "regular" | "inline";
  track: MiniPlayerTrack;
  isPlaying: boolean;
  onToggle: () => void;
  onOpen?: () => void;
}

const ARTWORK_MAX = 40;
const PLAY_MAX = 32;

const MiniPlayerChrome: React.FC<MiniPlayerChromeProps> = ({
  track,
  isPlaying,
  onToggle,
  onOpen,
}) => {
  const [slotHeight, setSlotHeight] = useState(0);
  const fitted = slotHeight > 0 ? slotHeight : ARTWORK_MAX;
  const artworkSize = Math.min(ARTWORK_MAX, fitted);
  const playSize = Math.min(PLAY_MAX, fitted);
  const playLabel = isPlaying ? "Pause" : "Play";

  const onSlotLayout = (event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height);
    setSlotHeight((current) => (current === next ? current : next));
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }} onLayout={onSlotLayout}>
      <HStack
        spacing="sm"
        align="center"
        style={{
          height: artworkSize,
          overflow: "hidden",
          paddingHorizontal: 12,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mini player"
          onPress={onOpen}
          style={{ flex: 1, minWidth: 0 }}
        >
          <HStack spacing="sm" align="center">
            <CoverImage
              uri={track.artworkUrl}
              width={artworkSize}
              height={artworkSize}
              radius={12}
              accessibilityLabel="Track artwork"
              style={{ flexShrink: 0 }}
            />
            <VStack spacing="none" className="min-w-0 flex-1">
              <Text
                className="font-app-medium text-sm text-text"
                numberOfLines={1}
              >
                {track.title}
              </Text>
              <Text className="text-xs text-text/50" numberOfLines={1}>
                {track.artistName}
              </Text>
            </VStack>
          </HStack>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playLabel}
          onPress={onToggle}
          className="items-center justify-center bg-primary"
          style={{
            width: playSize,
            height: playSize,
            borderRadius: playSize / 2,
            flexShrink: 0,
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={Math.round(playSize * 0.45)}
            color={COLORS.textOnPrimary}
          />
        </Pressable>
      </HStack>
    </View>
  );
};

export default MiniPlayerChrome;
