import { render, screen } from "@testing-library/react-native";

import HomeFeedSkeleton from "./HomeFeedSkeleton";

describe("HomeFeedSkeleton", () => {
  it("shows a track card, a photo card, and a voice-note card", () => {
    render(<HomeFeedSkeleton />);
    expect(screen.getByTestId("home-feed-skeleton")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(12);
  });
});
