import { Image } from "expo-image";
import { useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import { COLORS } from "@/constants";

/** The cover only moves in the last part of the close, once the sheet is nearly gone. */
export const COVER_HANDOFF = 0.18;

interface CollapsedArtwork {
  left: number;
  top: number;
  size: number;
}

interface PlayerArtworkFlightProps {
  progress: SharedValue<number>;
  artworkUrl: string | null;
  heroHeight: number;
  collapsed: CollapsedArtwork;
}

/**
 * A short settle from where the cover already sits, once the sheet is nearly
 * closed, into the mini-player square. Hidden for the rest of the drag.
 */
const PlayerArtworkFlight: React.FC<PlayerArtworkFlightProps> = ({
  progress,
  artworkUrl,
  heroHeight,
  collapsed,
}) => {
  const { width, height } = useWindowDimensions();
  const frame = useAnimatedStyle(() => {
    const handoffTop = (1 - COVER_HANDOFF) * height;
    return {
      position: "absolute" as const,
      left: interpolate(
        progress.value,
        [0, COVER_HANDOFF],
        [collapsed.left, 0],
        Extrapolation.CLAMP
      ),
      top: interpolate(
        progress.value,
        [0, COVER_HANDOFF],
        [collapsed.top, handoffTop],
        Extrapolation.CLAMP
      ),
      width: interpolate(
        progress.value,
        [0, COVER_HANDOFF],
        [collapsed.size, width],
        Extrapolation.CLAMP
      ),
      height: interpolate(
        progress.value,
        [0, COVER_HANDOFF],
        [collapsed.size, heroHeight],
        Extrapolation.CLAMP
      ),
      borderRadius: interpolate(
        progress.value,
        [0, COVER_HANDOFF],
        [12, 0],
        Extrapolation.CLAMP
      ),
      opacity: interpolate(
        progress.value,
        [0, 0.04, COVER_HANDOFF - 0.06, COVER_HANDOFF],
        [0, 1, 1, 0],
        Extrapolation.CLAMP
      ),
      overflow: "hidden" as const,
      zIndex: 40,
      backgroundColor: COLORS.surface,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={frame}>
      {artworkUrl ? (
        <Image
          accessibilityLabel="Moving album artwork"
          source={{ uri: artworkUrl }}
          contentFit="cover"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.surface,
          }}
        />
      ) : null}
    </Animated.View>
  );
};

export default PlayerArtworkFlight;
