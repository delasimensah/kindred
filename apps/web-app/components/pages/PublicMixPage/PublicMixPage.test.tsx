import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import PublicMixPage from "./PublicMixPage";

const mix = {
  slug: "late-night",
  name: "Late Night Highlife",
  why: "A slow wind-down.",
  curatorName: "Akosua Frimpong",
  artworkUrl: null,
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
};

describe("PublicMixPage", () => {
  it("plays public songs and locks an exclusive", async () => {
    const user = setupUser();
    const onPlayTrack = jest.fn();
    render(
      <PublicMixPage
        mix={mix}
        activeTrackId={null}
        playing={false}
        onPlayTrack={onPlayTrack}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /play late night highlife/i })
    );
    expect(onPlayTrack).toHaveBeenCalledWith(mix.tracks, "track_public");
    expect(
      screen.getByRole("button", { name: /get the app to hear night mix/i })
    ).toBeInTheDocument();
  });
});
