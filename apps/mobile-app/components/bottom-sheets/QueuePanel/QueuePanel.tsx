import {
  type BottomSheetMethods,
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TEXT_SECONDARY_OPACITY } from "shared";

import { COLORS } from "@/constants";
import type { QueueTrack, RepeatMode } from "@/hooks";
import { tapHaptic } from "@/utils";

import NowPlayingRow from "../../player/NowPlayingRow/NowPlayingRow";
import QueueDragRow from "../../player/QueueDragRow/QueueDragRow";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

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
  onPlay: (slot: number) => void;
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
      onPlay,
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
        // The native sheet uses this same vertical drag, so reordering moved the sheet.
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: COLORS.page }}
      >
        <BottomSheetView style={{ flex: 1, height: height * 0.9 }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <HStack align="center" justify="between" className="px-6 pb-4 pt-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close queue"
                onPress={() => sheetRef.current?.dismiss()}
                className="h-11 w-11 items-center justify-center rounded-full bg-surface"
              >
                <Ionicons name="chevron-down" size={22} color={COLORS.text} />
              </Pressable>
              <Text
                className="font-display-bold text-xl"
                style={{ color: COLORS.text }}
              >
                Queue
              </Text>
              <HStack spacing="none" align="center">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={shuffle ? "Shuffle on" : "Shuffle off"}
                  onPress={onShuffle}
                  className="h-11 w-11 items-center justify-center overflow-hidden rounded-full"
                >
                  {shuffle ? (
                    <VStack
                      spacing="none"
                      className="absolute inset-0"
                      style={{
                        backgroundColor: COLORS.primary,
                        opacity: 0.15,
                      }}
                    />
                  ) : null}
                  <Ionicons
                    name="shuffle"
                    size={22}
                    color={shuffle ? COLORS.primary : COLORS.text}
                    style={{
                      opacity: shuffle ? 1 : TEXT_SECONDARY_OPACITY,
                    }}
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
                  className="h-11 w-11 items-center justify-center rounded-full"
                >
                  <Ionicons
                    name="repeat"
                    size={22}
                    color={repeat === "off" ? COLORS.text : COLORS.primary}
                    style={{
                      opacity: repeat === "off" ? TEXT_SECONDARY_OPACITY : 1,
                    }}
                  />
                  {repeat === "one" ? (
                    <Text
                      className="absolute right-1.5 top-1 text-[11px]"
                      style={{ color: COLORS.primary }}
                    >
                      1
                    </Text>
                  ) : null}
                </Pressable>
              </HStack>
            </HStack>

            <VStack spacing="sm" className="px-6">
              <Text
                className="font-app-semibold text-[13px] uppercase tracking-wider"
                style={{ color: COLORS.primary }}
              >
                Now playing
              </Text>
              <NowPlayingRow track={current} isPlaying={isPlaying} />
              <HStack justify="between" align="center" className="pt-4">
                <Text
                  className="font-app-semibold text-[13px] uppercase tracking-wider"
                  style={{
                    color: COLORS.text,
                    opacity: TEXT_SECONDARY_OPACITY,
                  }}
                >
                  Next up
                </Text>
                <Text
                  className="text-[13px]"
                  style={{
                    color: COLORS.text,
                    opacity: TEXT_SECONDARY_OPACITY,
                  }}
                >
                  {upcoming.length} {upcoming.length === 1 ? "track" : "tracks"}
                </Text>
              </HStack>
            </VStack>
            {upcoming.length === 0 ? (
              <Text
                className="px-6 pt-3 text-base"
                style={{ color: COLORS.text, opacity: TEXT_SECONDARY_OPACITY }}
              >
                Nothing is queued after this.
              </Text>
            ) : (
              <DraggableFlatList
                data={upcoming}
                keyExtractor={(item, index) => `${item.trackId}-${index}`}
                activationDistance={0}
                onDragEnd={({ from, to }) => {
                  if (from !== to) {
                    void tapHaptic("drop");
                  }
                  onMove(from, to);
                }}
                renderItem={({
                  item,
                  drag,
                  isActive,
                  getIndex,
                }: RenderItemParams<QueueTrack>) => {
                  const slot = getIndex() ?? 0;
                  return (
                    <ScaleDecorator activeScale={1.03}>
                      <QueueDragRow
                        track={item}
                        drag={item.locked ? undefined : drag}
                        active={isActive}
                        onPlay={() => onPlay(slot)}
                        onRemove={() => onRemove(slot)}
                      />
                    </ScaleDecorator>
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
