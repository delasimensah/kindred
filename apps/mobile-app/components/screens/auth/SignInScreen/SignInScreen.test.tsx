import { render, screen } from "@testing-library/react-native";

import SignInScreen from "./SignInScreen";

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: jest.fn() }),
}));

describe("SignInScreen", () => {
  it("starts on email and has no social login", () => {
    render(<SignInScreen />);
    expect(screen.getByText("What's your email?")).toBeTruthy();
    expect(screen.queryByText("Create account")).toBeNull();
    expect(screen.queryByText("Email and password only.")).toBeNull();
    expect(screen.queryByText(/google/i)).toBeNull();
    expect(screen.queryByText(/apple/i)).toBeNull();
    expect(screen.queryByText(/facebook/i)).toBeNull();
    expect(screen.queryByText(/forgot/i)).toBeNull();
  });
});
