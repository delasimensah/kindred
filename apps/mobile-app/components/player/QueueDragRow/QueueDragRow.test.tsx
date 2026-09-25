import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

import type { QueueTrack } from "@/hooks";

import QueueDragRow from "./QueueDragRow";

const track: QueueTrack = {
  trackId: "tr_asase",
  title: "Asase",
  artistName: "Amaara Mensah",
  artistId: "ar_amaara",
  artworkUrl: null,
  durationMs: 180000,
  locked: true,
  peaks: [],
  source: "library",
};

describe("QueueDragRow", () => {
  it("marks a locked track as skipped", () => {
    render(
      <QueueDragRow track={track} onPlay={jest.fn()} onRemove={jest.fn()} />
    );
    expect(screen.getByText("Asase")).toBeTruthy();
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
    expect(screen.getByText("Skipped")).toBeTruthy();
    expect(screen.queryByLabelText("Remove Asase")).toBeNull();
  });

  it("removes a track only after confirmation", () => {
    const onRemove = jest.fn();
    const alert = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        const confirm = buttons?.find(
          (button) => button.style === "destructive"
        );
        confirm?.onPress?.();
      });
    render(
      <QueueDragRow
        track={{ ...track, locked: false }}
        onPlay={jest.fn()}
        onRemove={onRemove}
      />
    );
    fireEvent.press(screen.getByLabelText("Remove Asase"));
    expect(onRemove).toHaveBeenCalledTimes(1);
    alert.mockRestore();
  });

  it("plays the track when the row is tapped", () => {
    const onPlay = jest.fn();
    render(
      <QueueDragRow
        track={{ ...track, locked: false }}
        onPlay={onPlay}
        onRemove={jest.fn()}
      />
    );
    fireEvent.press(screen.getByRole("button", { name: "Asase" }));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("shows a reorder handle when drag is available", () => {
    render(
      <QueueDragRow
        track={{ ...track, locked: false }}
        drag={jest.fn()}
        onPlay={jest.fn()}
        onRemove={jest.fn()}
      />
    );
    expect(screen.getByLabelText("Reorder Asase")).toBeTruthy();
  });
});
