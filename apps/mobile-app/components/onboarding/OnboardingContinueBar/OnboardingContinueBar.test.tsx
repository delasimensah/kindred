import { fireEvent, render, screen } from "@testing-library/react-native";

import OnboardingContinueBar from "./OnboardingContinueBar";

describe("OnboardingContinueBar", () => {
  it("does not fire when disabled", () => {
    const onPress = jest.fn();
    render(<OnboardingContinueBar disabled onPress={onPress} />);
    fireEvent.press(screen.getByText("Continue"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
