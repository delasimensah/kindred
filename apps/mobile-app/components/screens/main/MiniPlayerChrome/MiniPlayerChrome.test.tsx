import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import MiniPlayerChrome from "./MiniPlayerChrome";

const track = { title: "Asase", artistName: "Amaara Mensah" };

function expectSquare(label: string) {
  const style = StyleSheet.flatten(screen.getByLabelText(label).props.style);
  expect(style.width).toBe(style.height);
  expect(style.width).toBeGreaterThan(0);
}

describe("MiniPlayerChrome", () => {
  it("keeps the same track row, with square artwork and play control, in the gap", () => {
    const onToggle = jest.fn();
    const { rerender } = render(
      <MiniPlayerChrome
        placement="regular"
        track={track}
        isPlaying
        onToggle={onToggle}
      />
    );

    expect(screen.getByText("Asase")).toBeTruthy();
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
    expectSquare("Track artwork");
    expectSquare("Pause");
    fireEvent.press(screen.getByLabelText("Pause"));
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <MiniPlayerChrome
        placement="inline"
        track={track}
        isPlaying={false}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText("Asase")).toBeTruthy();
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
    expectSquare("Track artwork");
    expectSquare("Play");
  });
});
