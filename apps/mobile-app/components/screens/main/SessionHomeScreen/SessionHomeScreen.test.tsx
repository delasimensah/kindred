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
        supporterLabel={null}
        onRequestArtist={onRequestArtist}
        onOpenPaywall={jest.fn()}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Signed in as Efua Boateng")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Request to become an artist"));
    expect(onRequestArtist).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByText("Sign out"));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText("Impact")).toBeNull();
  });

  it("opens Impact when this person is paying", () => {
    const onOpenImpact = jest.fn();
    render(
      <SessionHomeScreen
        displayName="Efua Boateng"
        isSigningOut={false}
        artistStatus="none"
        supporterLabel="Supporter · $9.99/mo"
        onRequestArtist={jest.fn()}
        onOpenPaywall={jest.fn()}
        onOpenImpact={onOpenImpact}
        onSignOut={jest.fn()}
      />
    );
    fireEvent.press(screen.getByLabelText("Impact"));
    expect(onOpenImpact).toHaveBeenCalledTimes(1);
  });
});
