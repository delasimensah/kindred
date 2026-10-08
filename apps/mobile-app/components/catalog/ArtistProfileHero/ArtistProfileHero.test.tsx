import { render, screen } from "@testing-library/react-native";

import ArtistProfileHero from "./ArtistProfileHero";

describe("ArtistProfileHero", () => {
  it("shows the artist name, counts, and live listener count on the cover", () => {
    render(
      <ArtistProfileHero
        name="Amaara Mensah"
        avatarUrl={null}
        coverUrl={null}
        followerCount={12}
        supporterCount={1}
        liveListenerCount={3}
      />
    );
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
    expect(screen.getByText("12 followers · 1 supporter")).toBeTruthy();
    expect(screen.getByLabelText("3 listening now")).toBeTruthy();
  });
});
