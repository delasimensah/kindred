import { fireEvent, render, screen } from "@testing-library/react-native";

import LibraryCollectionHeader from "./LibraryCollectionHeader";

describe("LibraryCollectionHeader", () => {
  it("plays the collection", () => {
    const onPlayAll = jest.fn();
    render(
      <LibraryCollectionHeader
        collection={{
          title: "Liked songs",
          detail: "3 liked tracks",
          artworkUrls: [],
        }}
        onPlayAll={onPlayAll}
      />
    );
    fireEvent.press(screen.getByLabelText("Play Liked songs"));
    expect(onPlayAll).toHaveBeenCalledTimes(1);
  });
});
