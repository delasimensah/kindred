import { fireEvent, render, screen } from "@testing-library/react-native";

import VoiceNoteChip from "./VoiceNoteChip";

describe("VoiceNoteChip", () => {
  it("shows the length and plays when a clip is available", () => {
    const onToggle = jest.fn();
    render(
      <VoiceNoteChip
        durationMs={42_000}
        isPlaying={false}
        canPlay
        onToggle={onToggle}
      />
    );
    expect(screen.getByText("0:42")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Play voice note"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
