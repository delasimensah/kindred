import { fireEvent, render, screen } from "@testing-library/react-native";

import OnboardingGenresScreen from "./OnboardingGenresScreen";

describe("OnboardingGenresScreen", () => {
  it("keeps Continue disabled until a genre is selected", () => {
    const onContinue = jest.fn();
    const onToggleGenre = jest.fn();
    render(
      <OnboardingGenresScreen
        selectedGenres={[]}
        onToggleGenre={onToggleGenre}
        onContinue={onContinue}
      />
    );
    fireEvent.press(screen.getByText("Continue"));
    expect(onContinue).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText("Highlife"));
    expect(onToggleGenre).toHaveBeenCalledWith("Highlife");
  });
});
