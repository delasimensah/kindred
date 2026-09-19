import { render, screen } from "@testing-library/react-native";

import SignInScreen from "./SignInScreen";

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: jest.fn() }),
}));

describe("SignInScreen", () => {
  it("shows the field and tenant sign-in copy", () => {
    render(<SignInScreen />);
    expect(screen.getByText("Kindred")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
    expect(
      screen.getByText(
        "Fans and supporters use this app. Artist Studio is on the web."
      )
    ).toBeTruthy();
  });
});
