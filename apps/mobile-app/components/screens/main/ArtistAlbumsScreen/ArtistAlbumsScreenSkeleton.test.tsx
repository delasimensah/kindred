import { render, screen } from "@testing-library/react-native";

import ArtistAlbumsScreenSkeleton from "./ArtistAlbumsScreenSkeleton";

describe("ArtistAlbumsScreenSkeleton", () => {
  it("matches the two-column album grid", () => {
    render(<ArtistAlbumsScreenSkeleton />);
    expect(screen.getByTestId("artist-albums-skeleton")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(12);
  });
});
