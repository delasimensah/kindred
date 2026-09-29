import { fireEvent, render, screen } from "@testing-library/react-native";

import RisingArtistsScreen from "./RisingArtistsScreen";

const artist = {
  artistId: "artist_kweku",
  name: "Kweku Darko",
  handle: "kweku-darko",
  bio: "Highlife · Kumasi",
  avatarUrl: null,
  coverUrl: null,
  isFollowed: false,
};

describe("RisingArtistsScreen", () => {
  it("opens an artist and follows from the row", () => {
    const onOpenArtist = jest.fn();
    const onToggleFollow = jest.fn();
    render(
      <RisingArtistsScreen
        artists={[artist]}
        isLoading={false}
        onOpenArtist={onOpenArtist}
        onToggleFollow={onToggleFollow}
      />
    );

    expect(screen.getByText("Kweku Darko")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Open Kweku Darko"));
    fireEvent.press(screen.getByLabelText("Follow Kweku Darko"));
    expect(onOpenArtist).toHaveBeenCalledWith("artist_kweku");
    expect(onToggleFollow).toHaveBeenCalledWith("artist_kweku");
  });

  it("shows artist rows while the list loads", () => {
    render(
      <RisingArtistsScreen
        artists={[]}
        isLoading
        onOpenArtist={jest.fn()}
        onToggleFollow={jest.fn()}
      />
    );

    expect(screen.getByTestId("rising-artists-skeleton")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBe(24);
  });
});
