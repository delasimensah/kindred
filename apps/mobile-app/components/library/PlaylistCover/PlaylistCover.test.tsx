import { render, screen } from "@testing-library/react-native";

import PlaylistCover from "./PlaylistCover";

describe("PlaylistCover", () => {
  it("shows a cover tile when the playlist has no artwork", () => {
    render(<PlaylistCover urls={[]} />);
    expect(screen.getByLabelText("Playlist cover")).toBeTruthy();
  });
});
