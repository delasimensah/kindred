import { fireEvent, render, screen } from "@testing-library/react-native";

import SessionHomeScreen from "./SessionHomeScreen";

const baseProps = {
  displayName: "Efua Boateng",
  email: "efua.boateng@kindred.example",
  isSigningOut: false,
  artistStatus: "pending" as const,
  restoring: false,
  notice: null,
  onRequestArtist: jest.fn(),
  onOpenRoute: jest.fn(),
  onOpenImpact: jest.fn(),
  onRestore: jest.fn(),
  onManageSubscription: jest.fn(),
  onEditProfile: jest.fn(),
  onSignOut: jest.fn(),
};

describe("SessionHomeScreen", () => {
  it("shows the account rows and signs out", () => {
    const onSignOut = jest.fn();
    const onRequestArtist = jest.fn();
    const onRestore = jest.fn();
    const onManageSubscription = jest.fn();
    const onEditProfile = jest.fn();
    render(
      <SessionHomeScreen
        {...baseProps}
        supporterLabel={null}
        onRequestArtist={onRequestArtist}
        onRestore={onRestore}
        onManageSubscription={onManageSubscription}
        onEditProfile={onEditProfile}
        onSignOut={onSignOut}
      />
    );

    expect(screen.getByText("Efua Boateng")).toBeTruthy();
    expect(screen.getByText("efua.boateng@kindred.example")).toBeTruthy();
    expect(screen.getByText("Not subscribed")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
    expect(screen.getByText("Change password")).toBeTruthy();
    expect(screen.getByText("Downloads")).toBeTruthy();
    expect(screen.getByText("Notification settings")).toBeTruthy();
    expect(
      screen.getByText("Billing is managed in the App Store or Google Play")
    ).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Request to become an artist"));
    expect(onRequestArtist).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText("Restore purchases"));
    expect(onRestore).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText("Manage subscription"));
    expect(onManageSubscription).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText("Change password"));
    fireEvent.press(screen.getByLabelText("Downloads"));
    fireEvent.press(screen.getByLabelText("Notification settings"));
    expect(screen.queryByText("This arrives in a later update.")).toBeNull();
    fireEvent.press(screen.getByLabelText("Edit Efua Boateng"));
    expect(onEditProfile).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText("Sign out"));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("shows the supporter price and opens Impact", () => {
    const onOpenImpact = jest.fn();
    const onOpenRoute = jest.fn();
    render(
      <SessionHomeScreen
        {...baseProps}
        artistStatus="none"
        supporterLabel="Supporter · $9.99/mo"
        onOpenImpact={onOpenImpact}
        onOpenRoute={onOpenRoute}
      />
    );

    expect(screen.getByText("Supporter · $9.99/mo")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Impact"));
    expect(onOpenImpact).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByLabelText("Route support"));
    expect(onOpenRoute).toHaveBeenCalledTimes(1);
  });
});
