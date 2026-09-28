import { fireEvent, render, screen } from "@testing-library/react-native";

import SessionHomeScreen from "./SessionHomeScreen";

describe("SessionHomeScreen", () => {
  it("shows the signed-in name and signs out", () => {
    const onSignOut = jest.fn();
    const onRequestArtist = jest.fn();
    render(
      <SessionHomeScreen
        displayName="Efua Boateng"
        isSigningOut={false}
        artistStatus="pending"
        onRequestArtist={onRequestArtist}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Signed in as Efua Boateng")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Request to become an artist"));
    expect(onRequestArtist).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByText("Sign out"));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
