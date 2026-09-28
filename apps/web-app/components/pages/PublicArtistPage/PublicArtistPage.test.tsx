import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import type { PublicArtist } from "./PublicArtistPage";
import PublicArtistPage from "./PublicArtistPage";

const artist: PublicArtist = {
  name: "Amaara Mensah",
  handle: "amaara",
  bio: "Afro-soul and R&B · Accra",
  avatarUrl: null,
  coverUrl: null,
  followerCount: 12,
  tracks: [
    {
      trackId: "track_public",
      title: "Asase",
      artistId: "artist_1",
      artistName: "Amaara Mensah",
      artistHandle: "amaara",
      artworkUrl: null,
      durationMs: 180000,
      locked: false,
      kindLabel: "Single",
    },
    {
      trackId: "track_locked",
      title: "Night Mix",
      artistId: "artist_1",
      artistName: "Amaara Mensah",
      artistHandle: "amaara",
      artworkUrl: null,
      durationMs: 200000,
      locked: true,
      kindLabel: "Exclusive",
    },
  ],
  releases: [],
  posts: [],
};

describe("PublicArtistPage", () => {
  it("plays a public track and sends exclusives to the app", async () => {
    const user = setupUser();
    const onPlayTrack = jest.fn();
    render(
      <PublicArtistPage
        artist={artist}
        activeTrackId={null}
        playing={false}
        onPlayTrack={onPlayTrack}
      />
    );

    expect(screen.queryByRole("button", { name: /follow/i })).toBeNull();
    expect(screen.getByText(/12 followers/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^play asase$/i }));
    expect(onPlayTrack).toHaveBeenCalledWith(artist.tracks, "track_public");
    expect(
      screen.getByRole("link", { name: /get the app to hear night mix/i })
    ).toHaveAttribute("href", "/get-the-app");
    expect(
      screen.queryByRole("button", { name: /play night mix/i })
    ).toBeNull();
  });
});
