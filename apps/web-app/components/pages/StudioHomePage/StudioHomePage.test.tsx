import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import StudioHomePage from "./StudioHomePage";

const mockUseQuery = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

describe("StudioHomePage", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("shows metrics and recent releases for an artist", () => {
    mockUseQuery.mockReturnValue({
      artistId: "artists_1",
      artistName: "Amaara Mensah",
      handle: "amaara",
      avatarUrl: null,
      supporterCount: 12,
      scheduledCount: 0,
      nextScheduledAt: null,
      thankYouCount: 0,
      recentReleases: [
        {
          trackId: "tracks_1",
          title: "Osu Nights",
          state: "published",
          artworkUrl: null,
          publishedAt: Date.UTC(2026, 4, 12),
          publishAt: null,
        },
      ],
      recentThankYous: [],
    });

    render(<StudioHomePage />);

    expect(screen.getByText(/Amaara/)).toBeInTheDocument();
    expect(screen.getByText("Supporters")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Osu Nights")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("explains when no artist is linked", () => {
    mockUseQuery.mockReturnValue(null);
    render(<StudioHomePage />);
    expect(
      screen.getByRole("heading", { name: /no artist profile linked/i })
    ).toBeInTheDocument();
  });
});
