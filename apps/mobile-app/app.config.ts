import type { ConfigContext, ExpoConfig } from "expo/config";

const ASSET_PATHS = {
  appIcon: "./assets/icons/icon.png",
  splashIcon: "./assets/icons/splash-icon.png",
};

const BRAND_COLOR = "#222831";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_STAGING = process.env.APP_VARIANT === "staging";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.dmstudios.kindred.dev";
  }

  if (IS_STAGING) {
    return "com.dmstudios.kindred.staging";
  }

  return "com.dmstudios.kindred";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Kindred(Dev)";
  }

  if (IS_STAGING) {
    return "Kindred(Staging)";
  }

  return "Kindred";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "kindred",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "kindred",
  userInterfaceStyle: "automatic",
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
    icon: ASSET_PATHS.appIcon,
    supportsTablet: true,
    infoPlist: {
      ...config.ios?.infoPlist,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
    adaptiveIcon: {
      foregroundImage: ASSET_PATHS.appIcon,
      backgroundColor: BRAND_COLOR,
    },
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: "resize",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    "expo-image",
    "expo-asset",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Kindred uses your photos so you can set a profile picture or release artwork.",
        cameraPermission:
          "Kindred uses the camera so you can take a profile picture or release artwork.",
        microphonePermission: false,
      },
    ],
    [
      "expo-audio",
      {
        // Fans listen only — no mic / recording in V1.
        microphonePermission: false,
        recordAudioAndroid: false,
        enableBackgroundPlayback: true,
        enableBackgroundRecording: false,
      },
    ],
    [
      "expo-notifications",
      {
        color: "#FFD369",
        defaultChannel: "default",
        // Needed so a release push can wake a cold app and deep-link (KIND-60).
        enableBackgroundRemoteNotifications: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: BRAND_COLOR,
        image: ASSET_PATHS.splashIcon,
        imageWidth: 200,
        resizeMode: "contain",
        dark: {
          backgroundColor: BRAND_COLOR,
          image: ASSET_PATHS.splashIcon,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: "https://u.expo.dev/4b1a5361-8bc3-4e40-b90c-e65141666149",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    router: {},
    eas: {
      projectId: "4b1a5361-8bc3-4e40-b90c-e65141666149",
    },
  },
  owner: "dm-studios",
});
