import { fireEvent, render, screen } from "@testing-library/react-native";

import AuthTextField from "./AuthTextField";

describe("AuthTextField", () => {
  it("toggles a password without showing a field label", () => {
    render(
      <AuthTextField label="Password" icon="lock-closed" secureTextEntry />
    );
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.queryByText("PASSWORD")).toBeNull();
    fireEvent.press(screen.getByLabelText("Show password"));
    expect(screen.getByLabelText("Hide password")).toBeTruthy();
  });
});
