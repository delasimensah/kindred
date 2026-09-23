import { act, renderHook } from "@testing-library/react-native";
import React from "react";

import { PreviewPlayerProvider, usePreviewPlayer } from "../usePreviewPlayer";

function wrapper({ children }: { children: React.ReactNode }) {
  return <PreviewPlayerProvider>{children}</PreviewPlayerProvider>;
}

describe("usePreviewPlayer", () => {
  it("plays a track and pauses when that track is played again", () => {
    const { result } = renderHook(() => usePreviewPlayer(), { wrapper });
    const next = {
      trackId: "track_asase",
      title: "Asase",
      artistName: "Amaara Mensah",
    };

    act(() => result.current.play(next));
    expect(result.current.track.title).toBe("Asase");
    expect(result.current.isPlaying).toBe(true);

    act(() => result.current.play(next));
    expect(result.current.isPlaying).toBe(false);
  });
});
