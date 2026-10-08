import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import StudioSupportersPage from "./StudioSupportersPage";

const mockUseQuery = jest.fn();
const mockUsePaginatedQuery = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  usePaginatedQuery: (...args: unknown[]) => mockUsePaginatedQuery(...args),
}));

describe("StudioSupportersPage", () => {
  it("renders supporter rows from the server", () => {
    mockUseQuery.mockReturnValue({
      total: 1,
      foundingCount: 1,
    });
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        {
          profileId: "profiles_1",
          displayName: "Efua Boateng",
          avatarUrl: null,
          startedAt: Date.UTC(2026, 7, 12),
          founding: true,
        },
      ],
      status: "Exhausted",
      loadMore: jest.fn(),
    });

    render(<StudioSupportersPage />);

    expect(
      screen.getByRole("heading", { name: /supporters/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Efua Boateng")).toBeInTheDocument();
    expect(screen.getByText("EB")).toBeInTheDocument();
    expect(screen.getAllByText("Founding").length).toBeGreaterThan(0);
  });
});
