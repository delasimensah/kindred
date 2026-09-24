import { render, screen } from "@testing-library/react-native";

import AddToPlaylistSheet from "./AddToPlaylistSheet";

jest.mock("convex/react", () => ({
  useQuery: () => [
    {
      playlistId: "pl_night",
      name: "Night Drive",
      trackCount: 2,
      artworkUrls: [],
    },
  ],
  useMutation: () => jest.fn(),
}));

describe("AddToPlaylistSheet", () => {
  it("lists a playlist the track can join", () => {
    render(<AddToPlaylistSheet trackId="tr_asase" open onClose={jest.fn()} />);
    expect(screen.getByText("Night Drive")).toBeTruthy();
    expect(screen.getByLabelText("New playlist")).toBeTruthy();
  });
});
