import {
  type BottomSheetMethods,
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Platform, Pressable, useWindowDimensions } from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { COLORS } from "@/constants";
import type { QueueTrack, RepeatMode } from "@/hooks";

import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import { NowPlayingRow, QueueDragRow } from "./QueueRows";

interface QueuePanelProps {
  current: QueueTrack;
  upcoming: QueueTrack[];
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  onShuffle: () => void;
  onRepeat: () => void;
  onRemove: (slot: number) => void;
  onMove: (fromSlot: number, toSlot: number) => void;
}

const QueuePanel = forwardRef<BottomSheetMethods, QueuePanelProps>(
  (
    {
      current,
      upcoming,
      isPlaying,
      shuffle,
      repeat,
      onShuffle,
      onRepeat,
      onRemove,
      onMove,
    },
    ref
  ) => {
    const sheetRef = useRef<BottomSheetMethods>(null);
    const { height } = useWindowDimensions();
    const listHeight = Math.max(240, height * 0.9 - 230);
    useImperativeHandle(ref, () => ({
      snapToIndex: (index) => {
        sheetRef.current?.snapToIndex(index);
      },
      snapToPosition: (position) => {
        sheetRef.current?.snapToPosition(position);
      },
      expand: () => {
        sheetRef.current?.expand();
      },
      collapse: () => {
        sheetRef.current?.collapse();
      },
      close: () => {
        sheetRef.current?.close();
      },
      forceClose: () => {
        sheetRef.current?.forceClose();
      },
      present: () => {
        sheetRef.current?.present();
      },
      dismiss: () => {
        sheetRef.current?.dismiss();
      },
    }));

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["90%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={Platform.OS !== "android"}
        backgroundStyle={{ backgroundColor: COLORS.page }}
      >
        <BottomSheetView style={{ flex: 1, height: height * 0.9 }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <HStack align="center" justify="between" className="px-6 pb-4 pt-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close queue"
                onPress={() => sheetRef.current?.dismiss()}
                className="h-9 w-9 items-center justify-center rounded-full bg-surface"
              >
                <Ionicons name="chevron-down" size={16} color={COLORS.text} />
              </Pressable>
              <Text className="font-display-bold text-lg text-text">Queue</Text>
              <HStack spacing="none" align="center">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={shuffle ? "Shuffle on" : "Shuffle off"}
                  onPress={onShuffle}
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={
                    shuffle
                      ? { backgroundColor: "rgba(255,211,105,0.15)" }
                      : undefined
                  }
                >
                  <Ionicons
                    name="shuffle"
                    size={16}
                    color={shuffle ? COLORS.primary : "rgba(238,238,238,0.5)"}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    repeat === "off"
                      ? "Repeat off"
                      : repeat === "one"
                        ? "Repeat one"
                        : "Repeat all"
                  }
                  onPress={onRepeat}
                  className="h-9 w-9 items-center justify-center rounded-full"
                >
                  <Ionicons
                    name="repeat"
                    size={16}
                    color={
                      repeat === "off"
                        ? "rgba(238,238,238,0.5)"
                        : COLORS.primary
                    }
                  />
                  {repeat === "one" ? (
                    <Text className="absolute right-1 top-0.5 text-[9px] text-primary">
                      1
                    </Text>
                  ) : null}
                </Pressable>
              </HStack>
            </HStack>

            <VStack spacing="sm" className="px-6">
              <Text className="font-app-semibold text-[11px] uppercase tracking-wider text-primary">
                Now playing
              </Text>
              <NowPlayingRow track={current} isPlaying={isPlaying} />
              <HStack justify="between" align="center" className="pt-4">
                <Text className="font-app-semibold text-[11px] uppercase tracking-wider text-text/50">
                  Next up
                </Text>
                <Text className="text-[11px] text-text/30">
                  {upcoming.length} {upcoming.length === 1 ? "track" : "tracks"}
                </Text>
              </HStack>
            </VStack>
            {upcoming.length === 0 ? (
              <Text className="px-6 pt-3 text-sm text-text/50">
                Nothing is queued after this.
              </Text>
            ) : (
              <DraggableFlatList
                data={upcoming}
                keyExtractor={(item, index) => `${item.trackId}-${index}`}
                activationDistance={12}
                onDragEnd={({ from, to }) => {
                  onMove(from, to);
                }}
                renderItem={({
                  item,
                  drag,
                  getIndex,
                }: RenderItemParams<QueueTrack>) => {
                  const slot = getIndex() ?? 0;
                  return (
                    <QueueDragRow
                      track={item}
                      drag={item.locked ? undefined : drag}
                      onRemove={() => onRemove(slot)}
                    />
                  );
                }}
                containerStyle={{ height: listHeight }}
                style={{ height: listHeight }}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingBottom: 32,
                }}
              />
            )}
          </GestureHandlerRootView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

QueuePanel.displayName = "QueuePanel";

export default QueuePanel;
