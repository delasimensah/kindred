import { screen } from "@testing-library/react";
import { formatUsdFromCents } from "shared";

import { render } from "@/test-utils";

import StudioEarningsPage from "./StudioEarningsPage";

const mockUseQuery = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

describe("StudioEarningsPage", () => {
  it("shows month totals from the server", () => {
    mockUseQuery.mockReturnValue({
      current: {
        period: "2026-09",
        amountCents: 48200,
        storeFeeCents: 20657,
        supporterCount: 214,
      },
      prior: {
        period: "2026-08",
        amountCents: 42900,
        storeFeeCents: 18000,
        supporterCount: 190,
      },
      months: [
        {
          period: "2026-09",
          amountCents: 48200,
          storeFeeCents: 20657,
          supporterCount: 214,
        },
      ],
    });

    render(<StudioEarningsPage />);

    expect(
      screen.getByRole("heading", { name: /^earnings$/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(formatUsdFromCents(48200)).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/how it's calculated/i)).toBeInTheDocument();
    expect(screen.getByText("214")).toBeInTheDocument();
  });
});
