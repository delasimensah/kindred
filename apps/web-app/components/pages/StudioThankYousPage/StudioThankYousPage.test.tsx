import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import StudioThankYousPage from "./StudioThankYousPage";

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

describe("StudioThankYousPage", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();
    mockUseMutation.mockReturnValue(jest.fn());
  });
  it("shows a ranked fan with an editable draft", () => {
    mockUseQuery.mockReturnValue([
      {
        profileId: "profiles_1",
        displayName: "Efua Boateng",
        avatarUrl: null,
        startedAt: Date.UTC(2026, 7, 12),
        founding: true,
        listenMs30d: 120000,
        draft: "Efua, you've been here since the start.",
      },
    ]);

    render(<StudioThankYousPage />);

    expect(screen.getByText(/1 fans to thank/i)).toBeInTheDocument();
    expect(screen.getByText("Efua Boateng")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/Efua, you've been here since the start/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send thank-you/i })
    ).toBeInTheDocument();
  });
});
