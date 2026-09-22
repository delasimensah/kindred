import { render, screen } from "@testing-library/react-native";

import SignUpScreen from "./SignUpScreen";

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: jest.fn() }),
}));

describe("SignUpScreen", () => {
  it("starts on email and has no social login", () => {
    render(<SignUpScreen />);
    expect(screen.getByText("What's your name?")).toBeTruthy();
    expect(screen.queryByText("Already have an account?")).toBeNull();
    expect(screen.queryByText(/google/i)).toBeNull();
    expect(screen.queryByText(/apple/i)).toBeNull();
    expect(screen.queryByText(/facebook/i)).toBeNull();
  });
});
