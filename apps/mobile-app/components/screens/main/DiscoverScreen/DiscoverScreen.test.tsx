import { fireEvent, render, screen } from "@testing-library/react-native";

import DiscoverScreen from "./DiscoverScreen";

const featured = {
  artistId: "artist_sela",
  name: "Sela Okoro",
  handle: "sela-okoro",
  bio: "Amapiano · Lagos",
  avatarUrl: null,
  coverUrl: null,
  isFollowed: false,
};

const rising = {
  artistId: "artist_kweku",
  name: "Kweku Darko",
  handle: "kweku-darko",
  bio: "Highlife · Kumasi",
  avatarUrl: null,
  coverUrl: null,
  isFollowed: false,
};

describe("DiscoverScreen", () => {
  it("shows featured and rising artists and follows from the primary button", () => {
    const onToggleFollow = jest.fn();
    render(
      <DiscoverScreen
        displayName="Efua"
        featured={[featured]}
        rising={[rising]}
        isLoading={false}
        onToggleFollow={onToggleFollow}
        onOpenArtist={jest.fn()}
        onViewAllRising={jest.fn()}
        onOpenAccount={jest.fn()}
      />
    );

    expect(screen.getByText("Discover")).toBeTruthy();
    expect(screen.getByText("Sela Okoro")).toBeTruthy();
    expect(screen.getByText("Rising artists")).toBeTruthy();
    expect(screen.getByText("Kweku")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Follow Sela Okoro"));
    expect(onToggleFollow).toHaveBeenCalledWith("artist_sela");
  });

  it("opens an artist from a featured card", () => {
    const onOpenArtist = jest.fn();
    render(
      <DiscoverScreen
        displayName="Efua"
        featured={[featured]}
        rising={[rising]}
        isLoading={false}
        onToggleFollow={jest.fn()}
        onOpenArtist={onOpenArtist}
        onViewAllRising={jest.fn()}
        onOpenAccount={jest.fn()}
      />
    );

    fireEvent.press(screen.getByLabelText("Open Sela Okoro"));
    expect(onOpenArtist).toHaveBeenCalledWith("artist_sela");
  });

  it("opens account from the avatar", () => {
    const onOpenAccount = jest.fn();
    render(
      <DiscoverScreen
        displayName="Efua"
        featured={[featured]}
        rising={[]}
        isLoading={false}
        onToggleFollow={jest.fn()}
        onOpenArtist={jest.fn()}
        onViewAllRising={jest.fn()}
        onOpenAccount={onOpenAccount}
      />
    );

    fireEvent.press(screen.getByLabelText("Account"));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });

  it("keeps eight rising artists in the row and opens the rest from View all", () => {
    const onOpenArtist = jest.fn();
    const onToggleFollow = jest.fn();
    const onViewAllRising = jest.fn();
    const risingArtists = Array.from({ length: 9 }, (_, index) => ({
      ...rising,
      artistId: `artist_${index}`,
      name: `Name${index} Person`,
    }));
    render(
      <DiscoverScreen
        displayName="Efua"
        featured={[]}
        rising={risingArtists}
        isLoading={false}
        onToggleFollow={onToggleFollow}
        onOpenArtist={onOpenArtist}
        onViewAllRising={onViewAllRising}
        onOpenAccount={jest.fn()}
      />
    );

    expect(screen.getByText("Name0")).toBeTruthy();
    expect(screen.getByText("Name7")).toBeTruthy();
    expect(screen.queryByLabelText("Open Name8 Person")).toBeNull();
    fireEvent.press(screen.getByLabelText("Follow Name0 Person"));
    fireEvent.press(screen.getByLabelText("Open Name0 Person"));
    fireEvent.press(screen.getByLabelText("View all rising artists"));
    expect(onToggleFollow).toHaveBeenCalledWith("artist_0");
    expect(onOpenArtist).toHaveBeenCalledWith("artist_0");
    expect(onViewAllRising).toHaveBeenCalledTimes(1);
  });

  it("shows rising cards with a follow pill while discover loads", () => {
    render(
      <DiscoverScreen
        displayName="Efua"
        featured={[]}
        rising={[]}
        isLoading
        onToggleFollow={jest.fn()}
        onOpenArtist={jest.fn()}
        onViewAllRising={jest.fn()}
        onOpenAccount={jest.fn()}
      />
    );

    expect(screen.getByTestId("discover-skeleton")).toBeTruthy();
    expect(screen.getByText("Rising artists")).toBeTruthy();
    expect(screen.getAllByTestId("skeleton-card").length).toBe(15);
  });
});
