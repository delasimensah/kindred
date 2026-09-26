import { screen, waitFor } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import StudioUpdatesPage from "./StudioUpdatesPage";

const mockUseQuery = jest.fn();
const mockRemove = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: () => mockRemove,
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  return {
    ...actual,
    showErrorNotification: jest.fn(),
    showSuccessNotification: jest.fn(),
  };
});

describe("StudioUpdatesPage", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockRemove.mockReset();
    mockRemove.mockResolvedValue(null);
  });

  it("lists updates and deletes from the confirm modal", async () => {
    const user = setupUser();
    const profile = {
      artistId: "artists_1",
      name: "Amaara Mensah",
      handle: "amaara",
      bio: "Highlife",
      avatarUrl: null,
      coverUrl: null,
      verified: true,
      hidden: false,
    };
    const posts = [
      {
        postId: "posts_1",
        createdAt: Date.now() - 2 * 86_400_000,
        audience: "everyone" as const,
        body: "Back in the studio this week.",
        photoUrl: null,
        voiceDurationMs: null,
        voiceUrl: null,
        voicePeaks: [],
      },
      {
        postId: "posts_2",
        createdAt: Date.now() - 5 * 86_400_000,
        audience: "supporters" as const,
        body: "Early rough mix for you.",
        photoUrl: null,
        voiceDurationMs: null,
        voiceUrl: null,
        voicePeaks: [],
      },
    ];
    let call = 0;
    mockUseQuery.mockImplementation(() => {
      call += 1;
      return call % 2 === 1 ? profile : posts;
    });

    render(<StudioUpdatesPage />);

    expect(
      screen.getByRole("heading", { name: /^updates$/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Everyone")).toBeInTheDocument();
    expect(screen.getByText("Supporters only")).toBeInTheDocument();
    const editLinks = screen.getAllByRole("link", { name: /^edit$/i });
    expect(editLinks[0]).toHaveAttribute(
      "href",
      "/updates/compose?postId=posts_1"
    );

    await user.click(screen.getAllByRole("button", { name: /^delete$/i })[0]!);
    await waitFor(() => {
      expect(
        screen.getByText(/fans will no longer see this update/i)
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /^delete update$/i }));
    expect(mockRemove).toHaveBeenCalledWith({ postId: "posts_1" });
  });
});
