import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import SignUpForm from "./SignUpForm";

const mockSignIn = jest.fn();

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: mockSignIn }),
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignIn.mockResolvedValue(undefined);
  });

  it("creates an account name then email then password", async () => {
    render(<SignUpForm />);
    fireEvent.changeText(screen.getByLabelText("Full name"), "Efua Boateng");
    fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeTruthy();
    });

    fireEvent.changeText(
      screen.getByLabelText("Email"),
      "efua.boateng@kindredmail.com"
    );
    fireEvent.press(screen.getByText("Continue"));

    await waitFor(() => {
      expect(screen.getByLabelText("Password")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByLabelText("Password"), "kindredsound24");
    fireEvent.press(screen.getByText("Create account"));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("password", {
        email: "efua.boateng@kindredmail.com",
        password: "kindredsound24",
        name: "Efua Boateng",
        flow: "signUp",
      });
    });
  });
});
