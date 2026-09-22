import "react-native-reanimated";
import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { cssInterop } from "nativewind";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import {
  ActiveToast,
  AppProviders,
  BottomSheetsManager,
  ErrorToast,
  NeutralToast,
  SuccessToast,
} from "@/components";
import { COLORS, FONT_LOADING_MAP } from "@/constants";
import { useApplyAvailableUpdate, useFanSession } from "@/hooks";
import {
  defaultStackScreenOptions,
  navigationTheme,
  screenPresets,
} from "@/utils";

cssInterop(Image, { className: "style" });
cssInterop(ImageBackground, { className: "style" });
cssInterop(LinearGradient, { className: "style" });

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

const RootNavigator = () => {
  const { isSessionLoading, isAuthenticated, isViewerReady } = useFanSession();
  const isCheckingUpdate = useApplyAvailableUpdate();
  const isHoldingSplash =
    isSessionLoading || isCheckingUpdate || (isAuthenticated && !isViewerReady);

  useEffect(() => {
    if (!isHoldingSplash) {
      void SplashScreen.hideAsync();
    }
  }, [isHoldingSplash]);

  if (isHoldingSplash) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        ...defaultStackScreenOptions,
        ...screenPresets.noHeader,
        animation: "none",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Protected guard={isAuthenticated && isViewerReady}>
        <Stack.Screen name="(main-app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
};

const RootLayout = () => {
  const [loaded, error] = useFonts({
    ...FONT_LOADING_MAP,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView
      className="flex-1 bg-page"
      style={{ backgroundColor: COLORS.page }}
    >
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <AppProviders>
            <BottomSheetModalProvider>
              <RootNavigator />
              <BottomSheetsManager />
              <Toast
                config={{
                  active: (props) => <ActiveToast {...props} />,
                  neutral: (props) => <NeutralToast {...props} />,
                  success: (props) => <SuccessToast {...props} />,
                  error: (props) => <ErrorToast {...props} />,
                }}
              />
            </BottomSheetModalProvider>
          </AppProviders>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
