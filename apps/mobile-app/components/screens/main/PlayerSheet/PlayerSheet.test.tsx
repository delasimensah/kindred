import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen, within } from "@testing-library/react-native";

import { PreviewPlayerProvider } from "@/hooks";

import PlayerSheet from "./PlayerSheet";

jest.mock("expo-audio", () => ({
  createAudioPlayer: () => ({
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn(async () => undefined),
    setActiveForLockScreen: jest.fn(),
    clearLockScreenControls: jest.fn(),
    remove: jest.fn(),
  }),
  setAudioModeAsync: jest.fn(async () => undefined),
  useAudioPlayerStatus: () => ({
    playing: false,
    currentTime: 0,
    duration: 0,
    didJustFinish: false,
  }),
}));

jest.mock("convex/react", () => ({
  useConvex: () => ({
    query: jest.fn(async () => null),
    mutation: jest.fn(async () => null),
  }),
  useQuery: () => false,
  useMutation: () => jest.fn(),
}));

describe("PlayerSheet", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("shows the mini player on Android, where the tab bar has no accessory", async () => {
    render(
      <PreviewPlayerProvider>
        <PlayerSheet showCollapsedBar />
      </PreviewPlayerProvider>
    );

    const bar = await screen.findByLabelText("Mini player");
    expect(within(bar).getByText("Asase")).toBeTruthy();
    expect(within(bar).getByText("Amaara Mensah")).toBeTruthy();
  });
});
