import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import SignInPage from "./SignInPage";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
  useConvexAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
  }),
}));

describe("SignInPage", () => {
  it("shows Kindred Artist Studio wordmark and sign-in form", () => {
    render(<SignInPage />);

    expect(screen.getByRole("img", { name: "Kindred" })).toBeInTheDocument();
    expect(screen.getByText("Artist Studio")).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/request studio access from the kindred mobile app/i)
    ).toBeInTheDocument();
  });
});
