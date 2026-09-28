import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import type { BrowseFeatured } from "./PublicBrowsePage";
import PublicBrowsePage from "./PublicBrowsePage";

const featured: BrowseFeatured = {
  name: "Amaara Mensah",
  handle: "amaara",
  bio: "Afro-soul and R&B · Accra",
  avatarUrl: null,
  coverUrl: null,
  playTrack: {
    trackId: "track_public",
    title: "Asase",
    artworkUrl: null,
    durationMs: 180000,
  },
};

describe("PublicBrowsePage", () => {
  it("shows featured and rising and sends people to the app", async () => {
    const user = setupUser();
    const onPlayFeatured = jest.fn();
    render(
      <PublicBrowsePage
        featured={featured}
        rising={[
          {
            name: "Sela Okoro",
            handle: "sela-okoro",
            bio: "Amapiano · Lagos",
            avatarUrl: null,
            coverUrl: null,
          },
        ]}
        releases={[]}
        onPlayFeatured={onPlayFeatured}
      />
    );

    expect(screen.queryByRole("button", { name: /follow/i })).toBeNull();
    expect(
      screen.getByRole("link", { name: /amaara mensah/i })
    ).toHaveAttribute("href", "/artist/amaara");
    await user.click(screen.getByRole("button", { name: /play asase/i }));
    expect(onPlayFeatured).toHaveBeenCalled();
    expect(
      screen.getAllByRole("button", { name: /get the app/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getByText("Amapiano")).toBeInTheDocument();
  });
});
