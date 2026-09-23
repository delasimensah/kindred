import { ThemeProvider, useSegments } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useState } from "react";
import { Platform } from "react-native";

import MiniPlayerSlot, {
  type MiniPlayerTrack,
} from "@/components/screens/main/MiniPlayerSlot/MiniPlayerSlot";
import { COLORS } from "@/constants";
import { navigationTheme } from "@/utils";

/**
 * Native tabs, same shape as Platano: SF Symbols, one tint, minimize on scroll.
 * On iOS 26 the glass bar takes its icon color from the surface behind it.
 * That surface has to be the page color, or the icons go black and then white.
 * https://docs.expo.dev/router/advanced/native-tabs/
 */
const tabScreenStyle = { backgroundColor: COLORS.page };

const MainAppLayout = () => {
  const segments = useSegments();
  const isAccountOpen = isAccountSegment(segments);
  const activeTrack = useActiveTrack();

  return (
    <ThemeProvider value={navigationTheme}>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        disableTransparentOnScrollEdge
        tintColor={COLORS.primary}
        backgroundColor={Platform.OS === "android" ? COLORS.surface : undefined}
        tabBarRespectsIMEInsets
        hidden={isAccountOpen}
      >
        <NativeTabs.BottomAccessory>
          <MiniPlayerSlot
            track={activeTrack.track}
            isPlaying={activeTrack.isPlaying}
            onToggle={activeTrack.onToggle}
          />
        </NativeTabs.BottomAccessory>
        <NativeTabs.Trigger name="(home)" contentStyle={tabScreenStyle}>
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="discover" contentStyle={tabScreenStyle}>
          <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="safari.fill" md="explore" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="library" contentStyle={tabScreenStyle}>
          <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf="books.vertical.fill"
            md="library_music"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="search"
          role="search"
          contentStyle={tabScreenStyle}
        >
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
};

interface ActiveTrack {
  track: MiniPlayerTrack;
  isPlaying: boolean;
  onToggle: () => void;
}

/**
 * Stand-in so the accessory is visible on this shell.
 * The player ticket replaces this with the track that is actually playing.
 * Play state stays here: iOS draws the bar and the gap as two copies.
 */
function useActiveTrack(): ActiveTrack {
  const [isPlaying, setIsPlaying] = useState(true);

  return {
    track: { title: "Asase", artistName: "Amaara Mensah" },
    isPlaying,
    onToggle: () => setIsPlaying((playing) => !playing),
  };
}

function isAccountSegment(segments: readonly string[]): boolean {
  return segments[segments.length - 1] === "account";
}

export default MainAppLayout;
