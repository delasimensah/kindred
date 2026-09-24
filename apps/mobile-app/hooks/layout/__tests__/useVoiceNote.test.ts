import { act, renderHook } from "@testing-library/react-native";

import { useVoiceNote } from "../useVoiceNote";

const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  replace: jest.fn(),
  seekTo: jest.fn(),
};

jest.mock("expo-audio", () => ({
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => ({ playing: false }),
}));

describe("useVoiceNote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads the clip and starts playback", () => {
    const onStart = jest.fn();
    const { result } = renderHook(() => useVoiceNote());
    act(() => {
      result.current.toggle("https://example.com/voice.mp3", onStart);
    });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(mockPlayer.replace).toHaveBeenCalledWith({
      uri: "https://example.com/voice.mp3",
    });
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  it("remembers a scrub and does not start the clip until play", () => {
    const { result } = renderHook(() => useVoiceNote());
    act(() => {
      result.current.seek("https://example.com/voice.mp3", 0.4);
    });
    expect(mockPlayer.replace).not.toHaveBeenCalled();
    expect(mockPlayer.play).not.toHaveBeenCalled();
    expect(result.current.heldUrl).toBe("https://example.com/voice.mp3");
    expect(result.current.heldRatio).toBe(0.4);
    act(() => {
      result.current.toggle("https://example.com/voice.mp3");
    });
    expect(mockPlayer.replace).toHaveBeenCalledWith({
      uri: "https://example.com/voice.mp3",
    });
    expect(mockPlayer.play).not.toHaveBeenCalled();
  });
});
