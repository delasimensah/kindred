import { render, screen } from "@testing-library/react-native";

import OnboardingHeader from "./OnboardingHeader";

describe("OnboardingHeader", () => {
  it("renders the question and helper", () => {
    render(
      <OnboardingHeader
        title="What do you listen to?"
        subtitle="Pick a few genres to start."
      />
    );
    expect(screen.getByText("What do you listen to?")).toBeTruthy();
    expect(screen.getByText("Pick a few genres to start.")).toBeTruthy();
  });
});
