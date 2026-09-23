import { fireEvent, render, screen } from "@testing-library/react-native";

import HomeTabScreen from "./HomeTabScreen";

describe("HomeTabScreen", () => {
  it("opens account from the avatar", () => {
    const onOpenAccount = jest.fn();
    render(
      <HomeTabScreen displayName="Efua Boateng" onOpenAccount={onOpenAccount} />
    );

    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("No updates yet")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Account"));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });
});
