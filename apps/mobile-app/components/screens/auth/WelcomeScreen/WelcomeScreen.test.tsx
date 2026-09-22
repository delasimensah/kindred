import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import WelcomeScreen from "./WelcomeScreen";

describe("WelcomeScreen", () => {
  it("pushes create account and sign in, with no social buttons", () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push,
      replace: jest.fn(),
      back: jest.fn(),
      canGoBack: () => true,
    });
    render(<WelcomeScreen />);
    expect(screen.getByText("Find your sound.")).toBeTruthy();
    expect(screen.queryByText(/google/i)).toBeNull();
    expect(screen.queryByText(/apple/i)).toBeNull();
    expect(screen.queryByText(/facebook/i)).toBeNull();
    fireEvent.press(screen.getByText("Create account"));
    expect(push).toHaveBeenCalledWith("/(auth)/sign-up");
    fireEvent.press(screen.getByText("Sign in"));
    expect(push).toHaveBeenCalledWith("/(auth)/sign-in");
  });
});
