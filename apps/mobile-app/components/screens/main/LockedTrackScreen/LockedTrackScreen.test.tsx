import { fireEvent, render, screen } from "@testing-library/react-native";

import LockedTrackScreen from "./LockedTrackScreen";

describe("LockedTrackScreen", () => {
  it("opens the paywall from Support and from See plans", () => {
    const onOpenPaywall = jest.fn();
    render(
      <LockedTrackScreen
        title="Unreleased Demo"
        artistName="Amaara Mensah"
        artworkUrl={null}
        onClose={jest.fn()}
        onOpenPaywall={onOpenPaywall}
      />
    );

    expect(screen.getByText("This is for supporters")).toBeTruthy();
    fireEvent.press(screen.getByText("Support Amaara Mensah"));
    fireEvent.press(screen.getByText("See plans"));
    expect(onOpenPaywall).toHaveBeenCalledTimes(2);
  });
});
