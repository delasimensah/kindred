import { render, screen } from "@testing-library/react-native";

import FollowCounterPill from "./FollowCounterPill";

describe("FollowCounterPill", () => {
  it("shows how many artists are followed against the minimum", () => {
    render(<FollowCounterPill followCount={1} minimum={2} />);
    expect(screen.getByText("1 of 2 minimum")).toBeTruthy();
  });
});
