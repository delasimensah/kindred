import { fireEvent, render, screen } from "@testing-library/react-native";

import SessionHomeScreen from "./SessionHomeScreen";

describe("SessionHomeScreen", () => {
  it("shows the signed-in name and signs out", () => {
    const onSignOut = jest.fn();
    render(
      <SessionHomeScreen
        displayName="Efua Boateng"
        isSigningOut={false}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Signed in as Efua Boateng")).toBeTruthy();
    fireEvent.press(screen.getByText("Sign out"));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
