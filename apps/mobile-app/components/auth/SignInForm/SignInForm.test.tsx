import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import SignInForm from "./SignInForm";

const mockSignIn = jest.fn();

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: mockSignIn }),
}));

describe("SignInForm", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignIn.mockResolvedValue(undefined);
  });

  it("signs in with email and password", async () => {
    render(<SignInForm />);
    fireEvent.changeText(
      screen.getByLabelText("Email address"),
      "yaw.darko@kindred.gh"
    );
    fireEvent.changeText(screen.getByLabelText("Password"), "test-password");
    fireEvent.press(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("password", {
        email: "yaw.darko@kindred.gh",
        password: "test-password",
        flow: "signIn",
      });
    });
  });
});
