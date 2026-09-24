import { fireEvent, render, screen } from "@testing-library/react-native";

import TrackReactionRow from "./TrackReactionRow";

const mockSetReaction = jest.fn();

jest.mock("convex/react", () => ({
  useQuery: () => ({ mine: "🔥", counts: { fire: 2, heart: 0 } }),
  useMutation: () => mockSetReaction,
}));

describe("TrackReactionRow", () => {
  it("shows the saved reaction and replaces it", () => {
    render(<TrackReactionRow trackId="track_asase" enabled />);
    expect(screen.getByText("2")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("React with ❤️"));
    expect(mockSetReaction).toHaveBeenCalledWith(
      expect.objectContaining({
        trackId: "track_asase",
        emoji: "❤️",
      })
    );
  });
});
