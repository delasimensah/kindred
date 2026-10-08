import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants";
import { normalizeTrack, useBottomsheetStore, usePreviewPlayer } from "@/hooks";

import MiniPlayerChrome from "../../screens/main/MiniPlayerChrome/MiniPlayerChrome";
import NowPlaying from "../NowPlaying/NowPlaying";

const { height: SCREEN_HEIGHT } = Dimensions.get("screen");
/** Material tab bar, plus a gap, so the bar sits above the tabs. */
const ANDROID_TAB_CLEARANCE = 88;

export interface PlayerSheetHandle {
  open: () => void;
}

interface PlayerSheetProps {
  /** Android has no tab-bar accessory, so the collapsed bar is drawn here. */
  showCollapsedBar: boolean;
}

/**
 * Kept, not mounted. The full player and the queue are both sheets in the same
 * stack, same as Aria. Opening the queue pushes it on top and the player stays
 * presented underneath. The app opens PlayerSheet instead.
 */
const PlayerSheetStack = forwardRef<PlayerSheetHandle, PlayerSheetProps>(
  ({ showCollapsedBar }, ref) => {
    const player = usePreviewPlayer();
    const openQueueSheet = useBottomsheetStore((s) => s.openQueueSheet);
    const closeQueueSheet = useBottomsheetStore((s) => s.closeQueueSheet);
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheetModal>(null);
    const seenQueueEpoch = useRef(player.queueEpoch);
    const shown = normalizeTrack(player.track);
    const snapPoints = useMemo(() => [SCREEN_HEIGHT], []);

    useEffect(() => {
      if (seenQueueEpoch.current === player.queueEpoch) {
        return;
      }
      seenQueueEpoch.current = player.queueEpoch;
      closeQueueSheet();
    }, [player.queueEpoch, closeQueueSheet]);

    const open = () => {
      sheetRef.current?.present();
    };
    const close = () => {
      closeQueueSheet();
      sheetRef.current?.dismiss();
    };

    useImperativeHandle(ref, () => ({ open }));

    if (!player.ready) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {showCollapsedBar ? (
          <View
            style={[
              styles.miniBar,
              { bottom: insets.bottom + ANDROID_TAB_CLEARANCE },
            ]}
          >
            <MiniPlayerChrome
              placement="regular"
              track={player.track}
              isPlaying={player.isPlaying}
              onToggle={player.toggle}
              onOpen={open}
            />
          </View>
        ) : null}

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose
          enableContentPanningGesture={false}
          stackBehavior="push"
          topInset={0}
          bottomInset={0}
          backgroundStyle={{ backgroundColor: COLORS.page }}
          handleComponent={null}
        >
          <BottomSheetView style={{ height: SCREEN_HEIGHT }}>
            <NowPlaying
              track={shown}
              isPlaying={player.isPlaying}
              shuffle={player.shuffle}
              repeat={player.repeat}
              progress={player.progress}
              positionMs={player.positionMs}
              durationMs={player.durationMs}
              onClose={close}
              onToggle={player.toggle}
              onPrevious={player.previous}
              onNext={player.next}
              onSeek={player.seek}
              onShuffle={() => player.setShuffle(!player.shuffle)}
              onRepeat={player.cycleRepeat}
              onQueue={openQueueSheet}
              onPlayNext={() => player.playNext(player.track)}
              onAddToQueue={() => player.addToQueue(player.track)}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    );
  }
);

PlayerSheetStack.displayName = "PlayerSheetStack";

const styles = StyleSheet.create({
  miniBar: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 64,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    zIndex: 20,
    ...(Platform.OS === "android" ? { elevation: 12 } : {}),
  },
});

export default PlayerSheetStack;
