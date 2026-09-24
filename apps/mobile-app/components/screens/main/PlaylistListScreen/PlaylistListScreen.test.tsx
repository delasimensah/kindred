import { fireEvent, render, screen } from "@testing-library/react-native";

import PlaylistListScreen from "./PlaylistListScreen";

describe("PlaylistListScreen", () => {
  it("creates and opens a playlist", () => {
    const onCreate = jest.fn();
    const onOpen = jest.fn();
    render(
      <PlaylistListScreen
        playlists={[
          {
            playlistId: "pl_1",
            name: "Late night",
            trackCount: 2,
            artworkUrls: [],
          },
        ]}
        isLoading={false}
        onCreate={onCreate}
        onOpen={onOpen}
        onDelete={jest.fn()}
      />
    );
    fireEvent.press(screen.getByLabelText("Create playlist"));
    fireEvent.press(screen.getByLabelText("Late night"));
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith("pl_1");
  });

  it("hides create playlist while the list is loading", () => {
    render(
      <PlaylistListScreen
        playlists={[]}
        isLoading
        onCreate={jest.fn()}
        onOpen={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.queryByLabelText("Create playlist")).toBeNull();
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(8);
  });
});
