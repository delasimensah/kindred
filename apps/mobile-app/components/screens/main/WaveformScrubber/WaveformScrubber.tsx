import React, { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { COLORS } from "@/constants";

import { centeredBarLayout, samplePeaks, WAVEFORM_HEIGHT } from "./waveform";

interface WaveformScrubberProps {
  peaks: number[];
  progress: number;
  onSeek: (ratio: number) => void;
}

const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
  peaks,
  progress,
  onSeek,
}) => {
  const [width, setWidth] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const bars = samplePeaks(peaks);
  const shown = scrub ?? Math.min(1, Math.max(0, progress));

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const ratioAt = (x: number) => {
    if (width <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, x / width));
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-6, 6])
    .onBegin((event) => {
      setScrub(ratioAt(event.x));
    })
    .onUpdate((event) => {
      setScrub(ratioAt(event.x));
    })
    .onEnd((event) => {
      const ratio = ratioAt(event.x);
      setScrub(null);
      onSeek(ratio);
    });

  const slot = width > 0 ? width / bars.length : 0;

  return (
    <GestureDetector gesture={pan}>
      <View
        accessibilityLabel="Waveform"
        onLayout={onLayout}
        style={{ height: WAVEFORM_HEIGHT, width: "100%" }}
      >
        {slot > 0
          ? bars.map((amplitude, index) => {
              const bar = centeredBarLayout(amplitude);
              const barWidth = Math.min(3, Math.max(2, slot - 1.5));
              const played = (index + 0.5) / bars.length <= shown;
              return (
                <View
                  key={index}
                  style={{
                    position: "absolute",
                    left: index * slot + (slot - barWidth) / 2,
                    top: bar.top,
                    width: barWidth,
                    height: bar.height,
                    borderRadius: barWidth / 2,
                    backgroundColor: played ? COLORS.primary : COLORS.text,
                    opacity: played ? 1 : 0.28,
                  }}
                />
              );
            })
          : null}
      </View>
    </GestureDetector>
  );
};

export default WaveformScrubber;
