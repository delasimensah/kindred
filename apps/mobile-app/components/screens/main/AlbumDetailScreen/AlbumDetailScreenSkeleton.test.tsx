import { render, screen } from "@testing-library/react-native";

import AlbumDetailScreenSkeleton from "./AlbumDetailScreenSkeleton";

describe("AlbumDetailScreenSkeleton", () => {
  it("matches the album hero and track-row layout", () => {
    render(<AlbumDetailScreenSkeleton />);
    expect(screen.getByTestId("album-detail-skeleton")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(10);
  });
});
