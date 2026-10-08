import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { COLORS } from "@/constants";
import { normalizeTrack, useBottomsheetStore, usePreviewPlayer } from "@/hooks";

import MiniPlayerChrome from "../../screens/main/MiniPlayerChrome/MiniPlayerChrome";
import NowPlaying from "../NowPlaying/NowPlaying";
import PlayerArtworkFlight from "../PlayerArtworkFlight/PlayerArtworkFlight";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SPRING = { stiffness: 400, damping: 60 };
/** Material tab bar, plus a gap, so the bar sits above the tabs. */
const ANDROID_TAB_CLEARANCE = 88;

export interface PlayerSheetHandle {
  open: () => void;
}

interface PlayerSheetProps {
  /** Android has no tab-bar accessory, so the collapsed bar is drawn here. */
  showCollapsedBar: boolean;
}

const PlayerSheet = forwardRef<PlayerSheetHandle, PlayerSheetProps>(
  ({ showCollapsedBar }, ref) => {
    const player = usePreviewPlayer();
    const openQueueSheet = useBottomsheetStore((s) => s.openQueueSheet);
    const closeQueueSheet = useBottomsheetStore((s) => s.closeQueueSheet);
    const queuePresented = useBottomsheetStore((s) => s.queuePresented);
    const setQueuePresented = useBottomsheetStore((s) => s.setQueuePresented);
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const progress = useSharedValue(0);
    const startProgress = useSharedValue(0);
    const queueOpen = useSharedValue(false);
    const seenQueueEpoch = useRef(player.queueEpoch);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      if (seenQueueEpoch.current === player.queueEpoch) {
        return;
      }
      seenQueueEpoch.current = player.queueEpoch;
      closeQueueSheet();
    }, [player.queueEpoch, closeQueueSheet]);
    const shown = normalizeTrack(player.track);

    useEffect(() => {
      queueOpen.value = queuePresented;
      if (!queuePresented) {
        return;
      }
      setExpanded(true);
      progress.value = withSpring(1, SPRING);
    }, [progress, queueOpen, queuePresented]);

    const open = () => {
      setExpanded(true);
      progress.value = withSpring(1, SPRING);
    };
    const close = () => {
      queueOpen.value = false;
      setQueuePresented(false);
      closeQueueSheet();
      setExpanded(false);
      progress.value = withSpring(0, SPRING);
    };
    const openQueue = () => {
      queueOpen.value = true;
      setQueuePresented(true);
      setExpanded(true);
      progress.value = withSpring(1, SPRING);
      openQueueSheet();
    };

    useImperativeHandle(ref, () => ({ open }));

    const dismissPan = useMemo(() => {
      const make = () =>
        Gesture.Pan()
          .minDistance(10)
          .activeOffsetY([-12, 12])
          .onTouchesDown((_, manager) => {
            if (queueOpen.value) {
              manager.fail();
            }
          })
          .onBegin(() => {
            if (queueOpen.value) {
              return;
            }
            startProgress.value = progress.value;
          })
          .onUpdate((event) => {
            if (queueOpen.value) {
              return;
            }
            const next =
              startProgress.value - event.translationY / SCREEN_HEIGHT;
            progress.value = Math.min(1, Math.max(0, next));
          })
          .onFinalize(() => {
            if (!queueOpen.value) {
              return;
            }
            progress.value = withSpring(1, SPRING);
            scheduleOnRN(setExpanded, true);
          })
          .onEnd((event) => {
            if (queueOpen.value) {
              progress.value = withSpring(1, SPRING);
              scheduleOnRN(setExpanded, true);
              return;
            }
            const shouldOpen =
              event.velocityY < -500 ||
              (event.velocityY >= -500 && progress.value > 0.5);
            scheduleOnRN(setExpanded, shouldOpen);
            if (!shouldOpen) {
              scheduleOnRN(closeQueueSheet);
            }
            progress.value = withSpring(shouldOpen ? 1 : 0, SPRING);
          });
      return { mini: make(), full: make() };
    }, [closeQueueSheet, progress, queueOpen, startProgress]);

    const fullPlayerStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: interpolate(
            progress.value,
            [0, 1],
            [SCREEN_HEIGHT, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    }));

    const miniBarStyle = useAnimatedStyle(() => ({
      opacity: interpolate(
        progress.value,
        [0, 0.3],
        [1, 0],
        Extrapolation.CLAMP
      ),
    }));

    if (!player.ready) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {showCollapsedBar ? (
          <GestureDetector gesture={dismissPan.mini}>
            <Animated.View
              style={[
                styles.miniBar,
                { bottom: insets.bottom + ANDROID_TAB_CLEARANCE },
                miniBarStyle,
              ]}
            >
              <MiniPlayerChrome
                placement="regular"
                track={player.track}
                isPlaying={player.isPlaying}
                onToggle={player.toggle}
                onOpen={open}
              />
            </Animated.View>
          </GestureDetector>
        ) : null}

        <Animated.View
          pointerEvents={expanded ? "auto" : "none"}
          style={[
            StyleSheet.absoluteFill,
            { zIndex: expanded ? 30 : 0, elevation: expanded ? 16 : 0 },
            fullPlayerStyle,
          ]}
        >
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
            onQueue={openQueue}
            onPlayNext={() => player.playNext(player.track)}
            onAddToQueue={() => player.addToQueue(player.track)}
            coverProgress={progress}
            dismissGesture={dismissPan.full}
          />
        </Animated.View>
        <PlayerArtworkFlight
          progress={progress}
          artworkUrl={shown.artworkUrl}
          heroHeight={height * 0.5}
          collapsed={{
            left: showCollapsedBar ? 24 : 20,
            size: 40,
            top: showCollapsedBar
              ? height -
                (insets.bottom + ANDROID_TAB_CLEARANCE) -
                64 +
                (64 - 40) / 2
              : height - Math.max(insets.bottom, 12) - 96,
          }}
        />
      </View>
    );
  }
);

PlayerSheet.displayName = "PlayerSheet";

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

export default PlayerSheet;
