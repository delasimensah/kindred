(process.env as { NODE_ENV?: string }).NODE_ENV = "test";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-modules-core", () => ({
  ...jest.requireActual("expo-modules-core"),
  requireOptionalNativeModule: (moduleName: string) =>
    moduleName === "ExpoBattery"
      ? null
      : jest
          .requireActual("expo-modules-core")
          .requireOptionalNativeModule(moduleName),
}));

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

jest.mock("react-native-gesture-handler", () => {
  const actual = jest.requireActual("react-native-gesture-handler");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, TouchableOpacity } = require("react-native");
  return {
    ...actual,
    GestureHandlerRootView: View,
    TouchableOpacity,
  };
});

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
    Fill: Mock,
    Shader: Mock,
    Group: Mock,
    Blur: Mock,
    Skia: {
      RuntimeEffect: {
        Make: () => ({}),
      },
    },
    useClock: () => ({ value: 0 }),
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

jest.mock("expo-linear-gradient", () => {
  const mockReact = require("react");
  return {
    LinearGradient: ({ children }: { children?: unknown }) =>
      mockReact.createElement("View", null, children),
  };
});

jest.mock("expo-image", () => {
  const mockReact = require("react");
  return {
    Image: (props: Record<string, unknown>) =>
      mockReact.createElement("Image", props),
    ImageBackground: ({ children }: { children?: unknown }) =>
      mockReact.createElement("View", null, children),
  };
});

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

jest.mock("@expo/ui/community/bottom-sheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  const { forwardRef, useImperativeHandle } = mockReact;
  const BottomSheetModal = forwardRef(
    (
      { children }: { children?: unknown },
      ref: { present?: () => void; dismiss?: () => void }
    ) => {
      useImperativeHandle(ref, () => ({
        present: () => undefined,
        dismiss: () => undefined,
        close: () => undefined,
        forceClose: () => undefined,
        expand: () => undefined,
        collapse: () => undefined,
        snapToIndex: () => undefined,
        snapToPosition: () => undefined,
      }));
      return mockReact.createElement("View", null, children);
    }
  );
  const BottomSheetView = ({ children }: { children?: unknown }) =>
    mockReact.createElement("View", null, children);
  return { BottomSheetModal, BottomSheetView };
});

jest.mock("@expo/ui/swift-ui", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  const Host = ({ children }: { children?: unknown }) =>
    mockReact.createElement("View", null, children);
  const Menu = ({ children, label }: { children?: unknown; label?: string }) =>
    mockReact.createElement("View", { accessibilityLabel: label }, children);
  const Button = ({
    label,
    onPress,
  }: {
    label?: string;
    onPress?: () => void;
  }) =>
    mockReact.createElement(
      "Pressable",
      { accessibilityLabel: label, onPress },
      label
    );
  return { Host, Menu, Button };
});

jest.mock("@expo/ui/community/menu", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  const MenuView = ({
    actions,
    onPressAction,
    children,
  }: {
    actions?: { id?: string; title: string }[];
    onPressAction?: (event: { nativeEvent: { event: string } }) => void;
    children?: unknown;
  }) =>
    mockReact.createElement(
      "View",
      null,
      children,
      ...(actions ?? []).map((action) =>
        mockReact.createElement("Pressable", {
          key: action.id ?? action.title,
          accessibilityLabel: action.title,
          onPress: () =>
            onPressAction?.({
              nativeEvent: { event: action.id ?? action.title },
            }),
        })
      )
    );
  return { MenuView };
});

jest.mock("react-native-draggable-flatlist", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mockReact = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { FlatList } = require("react-native");
  const DraggableFlatList = ({
    data,
    keyExtractor,
    renderItem,
    ListHeaderComponent,
    contentContainerStyle,
  }: {
    data: unknown[];
    keyExtractor?: (item: unknown, index: number) => string;
    renderItem: (info: {
      item: unknown;
      index: number;
      drag: () => void;
      isActive: boolean;
      getIndex: () => number;
    }) => unknown;
    ListHeaderComponent?: unknown;
    contentContainerStyle?: unknown;
  }) =>
    mockReact.createElement(FlatList, {
      data,
      keyExtractor,
      ListHeaderComponent,
      contentContainerStyle,
      renderItem: ({ item, index }: { item: unknown; index: number }) =>
        renderItem({
          item,
          index,
          drag: () => undefined,
          isActive: false,
          getIndex: () => index,
        }),
    });
  const ScaleDecorator = ({
    children,
  }: {
    children?: unknown;
    activeScale?: number;
  }) => children;
  return { __esModule: true, default: DraggableFlatList, ScaleDecorator };
});

jest.mock("@expo/ui/swift-ui/modifiers", () => ({
  menuStyle: () => ({}),
  buttonStyle: () => ({}),
  menuIndicator: () => ({}),
  labelStyle: () => ({}),
}));

jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    clearLockScreenControls: jest.fn(),
    remove: jest.fn(),
  })),
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
  })),
  setAudioModeAsync: jest.fn(async () => undefined),
  useAudioPlayerStatus: jest.fn(() => ({ playing: false })),
}));
