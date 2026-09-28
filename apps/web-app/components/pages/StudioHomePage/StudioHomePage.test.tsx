import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import StudioHomePage from "./StudioHomePage";

const { useStudioSession } = jest.requireMock("@/hooks") as {
  useStudioSession: jest.Mock;
};

const mockUseQuery = jest.fn();
const mockReplace = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/hooks", () => ({
  useStudioSession: jest.fn(() => ({ isAdmin: false, artistId: "artists_1" })),
}));

describe("StudioHomePage", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockReplace.mockReset();
    useStudioSession.mockReturnValue({
      isAdmin: false,
      artistId: "artists_1",
    });
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
    expect(screen.getByRole("link", { name: /thank a fan/i })).toHaveAttribute(
      "href",
      "/thank-yous"
    );
  });

  it("explains when no artist is linked", () => {
    useStudioSession.mockReturnValue({ isAdmin: false, artistId: null });
    mockUseQuery.mockReturnValue(null);
    render(<StudioHomePage />);
    expect(
      screen.getByRole("heading", { name: /no artist profile linked/i })
    ).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("sends an admin with no artist to the request queue", () => {
    useStudioSession.mockReturnValue({ isAdmin: true, artistId: null });
    mockUseQuery.mockReturnValue(null);
    render(<StudioHomePage />);
    expect(mockReplace).toHaveBeenCalledWith("/admin/requests");
    expect(
      screen.queryByRole("heading", { name: /no artist profile linked/i })
    ).toBeNull();
  });
});
