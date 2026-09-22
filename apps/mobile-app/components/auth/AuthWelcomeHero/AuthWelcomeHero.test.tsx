import { render, screen } from "@testing-library/react-native";

import AuthWelcomeHero from "./AuthWelcomeHero";

describe("AuthWelcomeHero", () => {
  it("shows the Kindred mark and welcome copy", () => {
    render(<AuthWelcomeHero />);
    expect(screen.getByLabelText("Kindred mark")).toBeTruthy();
    expect(screen.getByText("Find your sound.")).toBeTruthy();
    expect(screen.getByText("Back rising African artists.")).toBeTruthy();
  });
});
