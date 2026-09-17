import { render, screen } from "@testing-library/react-native";

import RoleWaitScreen from "./RoleWaitScreen";

describe("RoleWaitScreen", () => {
  it("shows Kindred, not the word Loading", () => {
    render(<RoleWaitScreen />);

    expect(screen.getByRole("header", { name: "Kindred" })).toBeTruthy();
    expect(screen.queryByText(/loading/i)).toBeNull();
  });
});
