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

  it("signs in with email then password", async () => {
    render(<SignInForm />);
    fireEvent.changeText(
      screen.getByLabelText("Email"),
      "efua.boateng@kindredmail.com"
    );
    fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByLabelText("Password")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByLabelText("Password"), "kindredsound24");
    fireEvent.press(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("password", {
        email: "efua.boateng@kindredmail.com",
        password: "kindredsound24",
        flow: "signIn",
      });
    });
  });
});
