import { fireEvent, render, screen } from "@testing-library/react-native";

import GenreTile from "./GenreTile";

describe("GenreTile", () => {
  it("toggles selection from the genre name", () => {
    const onPress = jest.fn();
    render(<GenreTile genre="Highlife" selected={false} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText("Highlife"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
