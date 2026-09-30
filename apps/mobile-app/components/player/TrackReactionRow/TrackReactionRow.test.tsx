import { fireEvent, render, screen } from "@testing-library/react-native";

import TrackReactionRow from "./TrackReactionRow";

const mockSetReaction = jest.fn();
const mockClearReaction = jest.fn();
let mockMutationIndex = 0;

jest.mock("convex/react", () => ({
  useQuery: () => ({
    mine: "🔥",
    counts: { fire: 2, heart: 0, praise: 0, clap: 0, sparkle: 0 },
  }),
  useMutation: () => {
    const next =
      mockMutationIndex % 2 === 0 ? mockSetReaction : mockClearReaction;
    mockMutationIndex += 1;
    return next;
  },
}));

describe("TrackReactionRow", () => {
  beforeEach(() => {
    mockMutationIndex = 0;
    mockSetReaction.mockClear();
    mockClearReaction.mockClear();
  });

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
    expect(mockClearReaction).not.toHaveBeenCalled();
  });

  it("clears the reaction when the selected emoji is tapped again", () => {
    render(<TrackReactionRow trackId="track_asase" enabled />);
    fireEvent.press(screen.getByLabelText("React with 🔥"));
    expect(mockClearReaction).toHaveBeenCalledWith({
      trackId: "track_asase",
    });
    expect(mockSetReaction).not.toHaveBeenCalled();
  });
});
