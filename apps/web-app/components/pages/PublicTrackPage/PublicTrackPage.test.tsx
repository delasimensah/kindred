import { screen } from "@testing-library/react";

import { render } from "@/test-utils";

import PublicTrackPage from "./PublicTrackPage";

const locked = {
  trackId: "track_locked",
  title: "Night Mix",
  artistId: "artist_1",
  artistName: "Amaara Mensah",
  artistHandle: "amaara",
  artworkUrl: null,
  durationMs: 200000,
  locked: true,
  kindLabel: "Exclusive",
};

describe("PublicTrackPage", () => {
  it("shows a locked shell instead of a play button", () => {
    render(
      <PublicTrackPage
        track={locked}
        description={null}
        publishedAt={null}
        artistAvatarUrl={null}
        more={[]}
        activeTrackId={null}
        playing={false}
        onPlayTrack={jest.fn()}
      />
    );

    expect(
      screen.queryByRole("button", { name: /play night mix/i })
    ).toBeNull();
    expect(
      screen.getByText(/supporters in the kindred app/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get the app to hear night mix/i })
    ).toHaveAttribute("href", "/get-the-app");
  });
});
