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
        onOpenAccount={onOpenAccount}
      />
    );

    fireEvent.press(screen.getByLabelText("Account"));
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });
});
