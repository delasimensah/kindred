import { render, screen } from "@testing-library/react-native";

import ArtistProfileHero from "./ArtistProfileHero";

describe("ArtistProfileHero", () => {
  it("shows the artist name and live listener count on the cover", () => {
    render(
      <ArtistProfileHero
        name="Amaara Mensah"
        imageUrl={null}
        liveListenerCount={3}
      />
    );
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
    expect(screen.getByLabelText("3 listening now")).toBeTruthy();
  });
});
