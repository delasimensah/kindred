import { render, screen } from "@testing-library/react-native";

import QueueArtwork from "./QueueArtwork";

describe("QueueArtwork", () => {
  it("shows a placeholder when the track has no cover", () => {
    render(<QueueArtwork url={null} size={48} />);
    expect(screen.getByLabelText("Track artwork")).toBeTruthy();
  });
});
