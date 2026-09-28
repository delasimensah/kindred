import { screen, within } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import AdminCatalogPage from "./AdminCatalogPage";
import type { CatalogTrackRowData } from "./CatalogTrackRow";

const track: CatalogTrackRowData = {
  trackId: "track_1",
  title: "Kokrobite Sessions",
  artistId: "artist_1",
  artistName: "Amaara Mensah",
  artworkUrl: null,
  visibility: "public",
  state: "published",
  hidden: false,
};

const pageProps = {
  search: "",
  browse: "artists" as const,
  searching: false,
  artists: [],
  artistMatches: [],
  tracks: [],
  resultsPending: false,
  canLoadMore: false,
  busyId: null,
  onSearchChange: jest.fn(),
  onBrowseChange: jest.fn(),
  onLoadMore: jest.fn(),
  onOpenArtist: jest.fn(),
  onSetArtistHidden: jest.fn(),
  onSetTrackHidden: jest.fn(),
  onRemoveTrack: jest.fn(),
};

describe("AdminCatalogPage", () => {
  it("opens an artist and hides a search result after confirm", async () => {
    const user = setupUser();
    const onOpenArtist = jest.fn();
    const onSetTrackHidden = jest.fn();
    const onRemoveTrack = jest.fn();
    const { rerender } = render(
      <AdminCatalogPage
        {...pageProps}
        artists={[
          {
            artistId: "artist_1",
            name: "Amaara Mensah",
            handle: "amaara",
            hidden: false,
            avatarUrl: null,
          },
        ]}
        onOpenArtist={onOpenArtist}
      />
    );

    await user.click(screen.getByRole("button", { name: /amaara mensah/i }));
    expect(onOpenArtist).toHaveBeenCalledWith("artist_1");

    rerender(
      <AdminCatalogPage
        {...pageProps}
        search="Kokrobite"
        searching
        tracks={[track]}
        onSetTrackHidden={onSetTrackHidden}
        onRemoveTrack={onRemoveTrack}
      />
    );
    await user.click(screen.getByRole("button", { name: /^hide$/i }));
    expect(onSetTrackHidden).toHaveBeenCalledWith("track_1", true);
    await user.click(screen.getByRole("button", { name: /^remove$/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /^remove$/i }));
    expect(onRemoveTrack).toHaveBeenCalledWith("track_1");
  });

  it("keeps the search field while results are loading", () => {
    render(
      <AdminCatalogPage {...pageProps} search="la" searching resultsPending />
    );

    expect(
      screen.getByRole("textbox", { name: /search tracks or artists/i })
    ).toHaveValue("la");
    expect(screen.getByLabelText("Searching catalog")).toBeInTheDocument();
    expect(screen.queryByText("No tracks match.")).not.toBeInTheDocument();
  });

  it("points an empty search at the queues", async () => {
    const user = setupUser();
    const onBrowseChange = jest.fn();
    render(
      <AdminCatalogPage
        {...pageProps}
        search="missing"
        searching
        onBrowseChange={onBrowseChange}
      />
    );

    expect(screen.getByText("No tracks match.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /check hidden/i }));
    expect(onBrowseChange).toHaveBeenCalledWith("hidden");
  });
});
