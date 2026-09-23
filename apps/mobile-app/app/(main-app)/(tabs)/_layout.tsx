import { ThemeProvider } from "expo-router";
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
 * Android keeps a quiet dark pill for the active indicator; gold is for the
 * selected icon and label only (not a full gold highlight blob).
 * https://docs.expo.dev/versions/latest/sdk/router/native-tabs/
 */
const tabScreenStyle = { backgroundColor: COLORS.page };

/** Between page and surface — Material-style soft indicator, not full primary. */
const ANDROID_TAB_INDICATOR = "#2C3138";

const MainTabsLayout = () => {
  const activeTrack = useActiveTrack();

  return (
    <ThemeProvider value={navigationTheme}>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        disableTransparentOnScrollEdge
        tintColor={COLORS.primary}
        backgroundColor={Platform.OS === "android" ? COLORS.surface : undefined}
        indicatorColor={
          Platform.OS === "android" ? ANDROID_TAB_INDICATOR : undefined
        }
        tabBarRespectsIMEInsets
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

export default MainTabsLayout;
