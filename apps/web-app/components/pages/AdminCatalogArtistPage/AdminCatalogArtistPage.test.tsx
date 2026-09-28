import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import AdminCatalogArtistPage from "./AdminCatalogArtistPage";

describe("AdminCatalogArtistPage", () => {
  it("shows a release apart from a single and hides the release", async () => {
    const user = setupUser();
    const onSetReleaseHidden = jest.fn();
    render(
      <AdminCatalogArtistPage
        artist={{
          artistId: "artist_1",
          name: "Amaara Mensah",
          handle: "amaara",
          hidden: false,
        }}
        scheduledReleases={[]}
        scheduledSingles={[]}
        scheduledHasMore={false}
        releases={[
          {
            releaseId: "release_1",
            title: "Lagoon",
            type: "ep",
            visibility: "public",
            state: "published",
            hidden: false,
            tracks: [
              {
                trackId: "track_1",
                title: "Lagoon One",
                artistId: "artist_1",
                artistName: "Amaara Mensah",
                artworkUrl: null,
                visibility: "public",
                state: "published",
                hidden: false,
              },
            ],
          },
        ]}
        singles={[
          {
            trackId: "track_2",
            title: "Loose Single",
            artistId: "artist_1",
            artistName: "Amaara Mensah",
            artworkUrl: null,
            visibility: "public",
            state: "published",
            hidden: false,
          },
        ]}
        canLoadReleases={false}
        canLoadSingles={false}
        busyId={null}
        onOpenScheduled={jest.fn()}
        onLoadReleases={jest.fn()}
        onLoadSingles={jest.fn()}
        onSetArtistHidden={jest.fn()}
        onSetReleaseHidden={onSetReleaseHidden}
        onSetTrackHidden={jest.fn()}
        onRemoveTrack={jest.fn()}
      />
    );

    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute(
      "href",
      "/admin/catalog"
    );
    expect(
      screen.getByRole("heading", { name: "Albums and EPs" })
    ).toBeInTheDocument();
    expect(screen.getByText("1 track in this EP")).toBeInTheDocument();
    expect(screen.getByText("Lagoon")).toBeInTheDocument();
    expect(screen.getByText("Loose Single")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /hide this ep/i }));
    expect(onSetReleaseHidden).toHaveBeenCalledWith("release_1", true);
  });
});
