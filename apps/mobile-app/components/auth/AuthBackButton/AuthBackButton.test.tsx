import { fireEvent, render, screen } from "@testing-library/react-native";

import AuthBackButton from "./AuthBackButton";

describe("AuthBackButton", () => {
  it("calls onPress", () => {
    const onPress = jest.fn();
    render(<AuthBackButton onPress={onPress} />);
    fireEvent.press(screen.getByLabelText("Back"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
