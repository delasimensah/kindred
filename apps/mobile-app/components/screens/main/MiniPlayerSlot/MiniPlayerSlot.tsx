import { NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

import MiniPlayerChrome, {
  type MiniPlayerTrack,
} from "../MiniPlayerChrome/MiniPlayerChrome";

interface MiniPlayerSlotProps {
  track: MiniPlayerTrack;
  isPlaying: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

/**
 * Apple's bottom accessory. iOS renders two copies at once (regular and inline)
 * and does not share state between them, so play state stays in the parent.
 * Both copies use the same row, sized to the slot, so the slide does not
 * stretch the artwork or the play button.
 * Android's tab host does not mount this slot.
 */
const MiniPlayerSlot: React.FC<MiniPlayerSlotProps> = (props) => {
  const placement = NativeTabs.BottomAccessory.usePlacement();

  return <MiniPlayerChrome placement={placement} {...props} />;
};

export type { MiniPlayerTrack };
export default MiniPlayerSlot;
