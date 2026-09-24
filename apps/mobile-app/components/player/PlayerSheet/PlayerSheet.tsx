import type { BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
import { normalizeTrack, usePreviewPlayer } from "@/hooks";

import QueuePanel from "../../bottom-sheets/QueuePanel/QueuePanel";
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
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const progress = useSharedValue(0);
    const startProgress = useSharedValue(0);
    const queueRef = useRef<BottomSheetMethods>(null);
    const seenQueueEpoch = useRef(player.queueEpoch);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      if (seenQueueEpoch.current === player.queueEpoch) {
        return;
      }
      seenQueueEpoch.current = player.queueEpoch;
      queueRef.current?.dismiss();
    }, [player.queueEpoch]);
    const shown = normalizeTrack(player.track);

    const closeQueue = () => {
      queueRef.current?.dismiss();
    };
    const open = () => {
      setExpanded(true);
      progress.value = withSpring(1, SPRING);
    };
    const close = () => {
      queueRef.current?.dismiss();
      setExpanded(false);
      progress.value = withSpring(0, SPRING);
    };

    useImperativeHandle(ref, () => ({ open }));

    const buildPan = () =>
      Gesture.Pan()
        .minDistance(10)
        .activeOffsetY([-12, 12])
        .onBegin(() => {
          startProgress.value = progress.value;
        })
        .onUpdate((event) => {
          const next = startProgress.value - event.translationY / SCREEN_HEIGHT;
          progress.value = Math.min(1, Math.max(0, next));
        })
        .onEnd((event) => {
          const shouldOpen =
            event.velocityY < -500 ||
            (event.velocityY >= -500 && progress.value > 0.5);
          scheduleOnRN(setExpanded, shouldOpen);
          if (!shouldOpen) {
            scheduleOnRN(closeQueue);
          }
          progress.value = withSpring(shouldOpen ? 1 : 0, SPRING);
        });

    const miniBarPan = buildPan();
    const fullPlayerPan = buildPan();

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
          <GestureDetector gesture={miniBarPan}>
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

        <GestureDetector gesture={fullPlayerPan}>
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
              onQueue={() => queueRef.current?.present()}
              onPlayNext={() => player.playNext(player.track)}
              onAddToQueue={() => player.addToQueue(player.track)}
              coverProgress={progress}
            />
          </Animated.View>
        </GestureDetector>
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
        <QueuePanel
          ref={queueRef}
          current={shown}
          upcoming={player.upcoming}
          isPlaying={player.isPlaying}
          shuffle={player.shuffle}
          repeat={player.repeat}
          onShuffle={() => player.setShuffle(!player.shuffle)}
          onRepeat={player.cycleRepeat}
          onRemove={player.removeUpcoming}
          onMove={player.moveUpcoming}
          onPlay={player.playUpcoming}
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
