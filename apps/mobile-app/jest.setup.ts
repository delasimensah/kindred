(process.env as { NODE_ENV?: string }).NODE_ENV = "test";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  Href: {},
  Link: "Link",
  DarkTheme: {
    dark: true,
    colors: {
      primary: "#000000",
      background: "#000000",
      card: "#000000",
      text: "#ffffff",
      border: "#333333",
      notification: "#ff0000",
    },
    fonts: {
      regular: { fontFamily: "System", fontWeight: "400" },
      medium: { fontFamily: "System", fontWeight: "500" },
      bold: { fontFamily: "System", fontWeight: "600" },
      heavy: { fontFamily: "System", fontWeight: "700" },
    },
  },
  ThemeProvider: ({ children }: { children: unknown }) => children,
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
}));

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.useReducedMotion = () => false;
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("@shopify/react-native-skia", () => {
  const mockReact = require("react");
  const Mock = ({ children }: { children?: unknown }) =>
    mockReact.createElement("View", null, children);

  return {
    Canvas: Mock,
    Circle: Mock,
    Group: Mock,
    Blur: Mock,
  };
});

jest.mock("@expo/vector-icons", () => {
  const mockReact = require("react");
  const MockIcon = (props: { name?: string }) =>
    mockReact.createElement("Text", props, props.name);

  return new Proxy(
    {},
    {
      get: () => MockIcon,
    }
  );
});

jest.mock("expo-image", () => ({
  Image: "Image",
  ImageBackground: "ImageBackground",
}));

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: false })),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  UIImagePickerPreferredAssetRepresentationMode: {
    Automatic: "automatic",
    Compatible: "compatible",
    Current: "current",
  },
}));

jest.mock("expo-file-system/legacy", () => ({
  FileSystemUploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
  uploadAsync: jest.fn(),
}));

jest.mock("expo-updates", () => ({
  isEnabled: false,
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
