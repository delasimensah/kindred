import { fireEvent, render, screen } from "@testing-library/react-native";

import HomeTabScreen from "./HomeTabScreen";

describe("HomeTabScreen", () => {
  it("opens account from the avatar", () => {
    const onOpenAccount = jest.fn();
    render(
      <HomeTabScreen displayName="Efua Boateng" onOpenAccount={onOpenAccount} />
    );

    expect(screen.getByText("Kindred")).toBeTruthy();
    expect(screen.getByText("Updates")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Account"));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });
});
