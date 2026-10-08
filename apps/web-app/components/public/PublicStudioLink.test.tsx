import { useConvexAuth } from "@convex-dev/auth/react";
import { screen } from "@testing-library/react";
import { useQuery } from "convex/react";

import { render } from "@/test-utils";

import PublicStudioLink from "./PublicStudioLink";

jest.mock("@convex-dev/auth/react", () => ({
  useConvexAuth: jest.fn(),
}));

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
}));

const mockAuth = useConvexAuth as jest.Mock;
const mockQuery = useQuery as jest.Mock;

describe("PublicStudioLink", () => {
  it("sends a signed-out visitor to artist sign-in", () => {
    mockAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    mockQuery.mockReturnValue(undefined);

    render(<PublicStudioLink />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/sign-in"
    );
  });

  it("opens the studio profile when this person is an artist", () => {
    mockAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockQuery.mockReturnValue({ artistId: "artist_1", isAdmin: false });

    render(<PublicStudioLink />);

    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  it("stays hidden for a signed-in fan", () => {
    mockAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    mockQuery.mockReturnValue({ artistId: null, isAdmin: false });

    render(<PublicStudioLink />);

    expect(screen.queryByRole("link")).toBeNull();
  });
});
