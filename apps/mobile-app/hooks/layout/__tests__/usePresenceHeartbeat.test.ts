import { act, renderHook } from "@testing-library/react-native";
import type { ConvexReactClient } from "convex/react";
import { PRESENCE_HEARTBEAT_MS } from "shared";

import { soloQueue } from "../playbackQueue";
import { usePresenceHeartbeat } from "../usePresenceHeartbeat";

describe("usePresenceHeartbeat", () => {
  const mutation = jest.fn(async () => null);
  const convex = { mutation } as unknown as ConvexReactClient;
  const queueRef = {
    current: soloQueue(
      {
        trackId: "track_asase",
        title: "Asase",
        artistName: "Amaara Mensah",
        artistId: "artists_amaara",
      },
      "off"
    ),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mutation.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("sends a heartbeat while playing and stops when paused", () => {
    const { rerender } = renderHook(
      ({ isPlaying }: { isPlaying: boolean }) =>
        usePresenceHeartbeat({
          convex,
          isPlaying,
          queueRef,
          trackKey: "track_asase:artists_amaara",
        }),
      { initialProps: { isPlaying: true } }
    );

    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(expect.anything(), {
      artistId: "artists_amaara",
      trackId: "track_asase",
    });

    act(() => {
      jest.advanceTimersByTime(PRESENCE_HEARTBEAT_MS);
    });
    expect(mutation).toHaveBeenCalledTimes(2);

    rerender({ isPlaying: false });
    act(() => {
      jest.advanceTimersByTime(PRESENCE_HEARTBEAT_MS * 2);
    });
    expect(mutation).toHaveBeenCalledTimes(2);
  });
});
