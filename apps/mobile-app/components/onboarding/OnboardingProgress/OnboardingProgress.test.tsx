import { render, screen } from "@testing-library/react-native";

import OnboardingProgress from "./OnboardingProgress";

describe("OnboardingProgress", () => {
  it("marks the second bar when on follows", () => {
    render(<OnboardingProgress step={2} />);
    expect(screen.getByLabelText("Step 2 of 2")).toBeTruthy();
  });
});
