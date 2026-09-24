import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";

import { PreviewPlayerProvider, usePreviewPlayer } from "../usePreviewPlayer";

const mockAudio = {
  play: jest.fn(),
  pause: jest.fn(),
  replace: jest.fn(),
  seekTo: jest.fn(async () => undefined),
  setActiveForLockScreen: jest.fn(),
  clearLockScreenControls: jest.fn(),
  remove: jest.fn(),
};

jest.mock("expo-audio", () => ({
  createAudioPlayer: () => mockAudio,
  setAudioModeAsync: jest.fn(async () => undefined),
  useAudioPlayerStatus: () => ({
    playing: false,
    currentTime: 0,
    duration: 0,
    didJustFinish: false,
  }),
}));

const mockQuery = jest.fn();
const mockMutation = jest.fn(async () => null);

jest.mock("convex/react", () => ({
  useConvex: () => ({ query: mockQuery, mutation: mockMutation }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <PreviewPlayerProvider>{children}</PreviewPlayerProvider>;
}

const next = {
  trackId: "track_asase",
  title: "Asase",
  artistName: "Amaara Mensah",
};

describe("usePreviewPlayer", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockAudio.play.mockClear();
    mockAudio.pause.mockClear();
    mockAudio.replace.mockClear();
    mockAudio.setActiveForLockScreen.mockClear();
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({
      audioUrl: "https://cdn.example/asase.mp3",
      title: "Asase",
      artistName: "Amaara Mensah",
      artworkUrl: "https://cdn.example/art.jpg",
    });
  });

  it("loads a public track onto the lock screen and pauses on the second tap", async () => {
    const { result } = renderHook(() => usePreviewPlayer(), { wrapper });

    act(() => result.current.play(next));
    expect(result.current.track.title).toBe("Asase");
    expect(result.current.isPlaying).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockAudio.replace).toHaveBeenCalledWith({
      uri: "https://cdn.example/asase.mp3",
    });
    expect(mockAudio.setActiveForLockScreen).toHaveBeenCalledWith(
      true,
      {
        title: "Asase",
        artist: "Amaara Mensah",
        artworkUrl: "https://cdn.example/art.jpg",
      },
      { showSeekForward: true, showSeekBackward: true }
    );
    expect(mockAudio.play).toHaveBeenCalledTimes(1);

    act(() => result.current.play(next));
    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
    expect(result.current.isPlaying).toBe(false);
  });

  it("plays the next track in the queue and stops after the last one", async () => {
    const coast = {
      trackId: "track_coast",
      title: "Coastline",
      artistName: "Sela Okoro",
    };
    const { result } = renderHook(() => usePreviewPlayer(), { wrapper });

    act(() => result.current.play(next, [next, coast]));
    await act(async () => {
      await Promise.resolve();
    });

    act(() => result.current.next());
    expect(result.current.track.trackId).toBe("track_coast");

    await act(async () => {
      await Promise.resolve();
    });

    act(() => result.current.next());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.track.trackId).toBe("track_coast");
  });

  it("does not play when the track is locked", async () => {
    mockQuery.mockResolvedValue(null);
    const { result } = renderHook(() => usePreviewPlayer(), { wrapper });

    act(() => result.current.play(next));
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(mockAudio.play).not.toHaveBeenCalled();
  });
});
