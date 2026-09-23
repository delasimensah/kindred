import { render, screen } from "@testing-library/react-native";

import ArtistProfileHero from "./ArtistProfileHero";

describe("ArtistProfileHero", () => {
  it("shows the artist name on the cover", () => {
    render(<ArtistProfileHero name="Amaara Mensah" imageUrl={null} />);
    expect(screen.getByText("Amaara Mensah")).toBeTruthy();
  });
});
