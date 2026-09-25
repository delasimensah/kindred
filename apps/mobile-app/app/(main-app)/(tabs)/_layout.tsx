import { ThemeProvider } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useRef } from "react";
import { Platform, View } from "react-native";

import { PlayerSheet, type PlayerSheetHandle } from "@/components";
import QueuePanel from "@/components/bottom-sheets/QueuePanel/QueuePanel";
import MiniPlayerSlot from "@/components/screens/main/MiniPlayerSlot/MiniPlayerSlot";
import { COLORS } from "@/constants";
import { PreviewPlayerProvider, usePreviewPlayer } from "@/hooks";
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
  return (
    // iOS mounts two accessory copies that do not share local state.
    <PreviewPlayerProvider>
      <TabsShell />
    </PreviewPlayerProvider>
  );
};

const TabsShell = () => {
  const player = usePreviewPlayer();
  const sheetRef = useRef<PlayerSheetHandle>(null);

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={{ flex: 1 }}>
        <NativeTabs
          minimizeBehavior="onScrollDown"
          disableTransparentOnScrollEdge
          tintColor={COLORS.primary}
          backgroundColor={
            Platform.OS === "android" ? COLORS.surface : undefined
          }
          indicatorColor={
            Platform.OS === "android" ? ANDROID_TAB_INDICATOR : undefined
          }
          tabBarRespectsIMEInsets
        >
          {Platform.OS === "ios" ? (
            <NativeTabs.BottomAccessory>
              <MiniPlayerSlot
                track={player.track}
                isPlaying={player.isPlaying}
                onToggle={player.toggle}
                onOpen={() => sheetRef.current?.open()}
              />
            </NativeTabs.BottomAccessory>
          ) : null}
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
        <PlayerSheet ref={sheetRef} showCollapsedBar={Platform.OS !== "ios"} />
        <QueuePanel />
      </View>
    </ThemeProvider>
  );
};

export default MainTabsLayout;
