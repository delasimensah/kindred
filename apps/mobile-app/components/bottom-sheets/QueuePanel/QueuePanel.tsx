import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Dimensions, Pressable } from "react-native";
import DraggableFlatList, {
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TEXT_SECONDARY_OPACITY } from "shared";

import { COLORS } from "@/constants";
import {
  normalizeTrack,
  type QueueTrack,
  useBottomsheetStore,
  usePreviewPlayer,
} from "@/hooks";
import { tapHaptic } from "@/utils";

import NowPlayingRow from "../../player/NowPlayingRow/NowPlayingRow";
import QueueDragRow from "../../player/QueueDragRow/QueueDragRow";
import { HStack, VStack } from "../../ui/Stack/Stack";
import Text from "../../ui/Text/Text";

/**
 * Always mounted under the player provider (same as Aria’s queue sheet).
 * Registers its ref in the bottomsheet store so Queue can call present()
 * without a prop chain through the animated player.
 */
const QueuePanel: React.FC = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const setQueueRef = useBottomsheetStore((s) => s.setQueueRef);
  const setQueueSheetOpen = useBottomsheetStore((s) => s.setQueueSheetOpen);
  const player = usePreviewPlayer();
  const current = normalizeTrack(player.track);
  const { height: screenHeight } = Dimensions.get("screen");
  const insets = useSafeAreaInsets();
  const topGap = Math.max(insets.top, 12) + 8;
  const sheetHeight = screenHeight - topGap;
  const snapPoints = useMemo(() => [sheetHeight], [sheetHeight]);

  useEffect(() => {
    setQueueRef(sheetRef);
    return () => setQueueRef(null);
  }, [setQueueRef]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const renderItem = useCallback(
    ({ item, drag, getIndex }: RenderItemParams<QueueTrack>) => {
      const slot = getIndex() ?? 0;
      return (
        <QueueDragRow
          track={item}
          drag={item.locked ? undefined : drag}
          onPlay={() => player.playUpcoming(slot)}
          onRemove={() => player.removeUpcoming(slot)}
        />
      );
    },
    [player]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      topInset={topGap}
      bottomInset={0}
      stackBehavior="push"
      onChange={(index) => {
        if (index >= 0) {
          setQueueSheetOpen(true);
        }
      }}
      onDismiss={() => setQueueSheetOpen(false)}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: COLORS.page,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
      handleIndicatorStyle={{
        backgroundColor: "rgba(238,238,238,0.2)",
        width: 40,
        height: 6,
      }}
    >
      <BottomSheetView
        style={{
          height: sheetHeight,
          paddingBottom: insets.bottom,
        }}
      >
        <VStack spacing="none" className="flex-1">
          <HStack align="center" justify="between" className="px-6 py-3">
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
                accessibilityLabel={
                  player.shuffle ? "Shuffle on" : "Shuffle off"
                }
                onPress={() => player.setShuffle(!player.shuffle)}
                className="h-11 w-11 items-center justify-center overflow-hidden rounded-full"
              >
                {player.shuffle ? (
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
                  color={player.shuffle ? COLORS.primary : COLORS.text}
                  style={{
                    opacity: player.shuffle ? 1 : TEXT_SECONDARY_OPACITY,
                  }}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  player.repeat === "off"
                    ? "Repeat off"
                    : player.repeat === "one"
                      ? "Repeat one"
                      : "Repeat all"
                }
                onPress={player.cycleRepeat}
                className="h-11 w-11 items-center justify-center rounded-full"
              >
                <Ionicons
                  name="repeat"
                  size={22}
                  color={player.repeat === "off" ? COLORS.text : COLORS.primary}
                  style={{
                    opacity:
                      player.repeat === "off" ? TEXT_SECONDARY_OPACITY : 1,
                  }}
                />
                {player.repeat === "one" ? (
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

          <VStack spacing="sm" className="px-6 pb-2">
            <Text
              className="font-app-semibold text-[13px] uppercase tracking-wider"
              style={{ color: COLORS.primary }}
            >
              Now playing
            </Text>
            <NowPlayingRow track={current} isPlaying={player.isPlaying} />
          </VStack>

          <VStack spacing="none" className="flex-1">
            <HStack justify="between" align="center" className="px-6 pb-2 pt-4">
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
                {player.upcoming.length}{" "}
                {player.upcoming.length === 1 ? "track" : "tracks"}
              </Text>
            </HStack>

            {player.upcoming.length === 0 ? (
              <Text
                className="px-6 pt-3 text-base"
                style={{
                  color: COLORS.text,
                  opacity: TEXT_SECONDARY_OPACITY,
                }}
              >
                Nothing is queued after this.
              </Text>
            ) : (
              <DraggableFlatList
                data={player.upcoming}
                keyExtractor={(item, index) => `${item.trackId}-${index}`}
                onDragEnd={({ from, to }) => {
                  if (from !== to) {
                    void tapHaptic("drop");
                  }
                  player.moveUpcoming(from, to);
                }}
                renderItem={renderItem}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingBottom: 50,
                }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </VStack>
        </VStack>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default QueuePanel;
