import { render, screen } from "@testing-library/react-native";

import ArtistUpdateCard from "./ArtistUpdateCard";

describe("ArtistUpdateCard", () => {
  it("shows public text and a lock line for supporters", () => {
    const { rerender } = render(
      <ArtistUpdateCard
        whenLabel="2h ago"
        audienceLabel="Public"
        body="Asase is finished."
        locked={false}
      />
    );
    expect(screen.getByText("Asase is finished.")).toBeTruthy();
    expect(screen.getByText("2h ago · Public")).toBeTruthy();

    rerender(
      <ArtistUpdateCard
        whenLabel="1d ago"
        audienceLabel="Supporters only"
        body={null}
        locked
      />
    );
    expect(screen.getByText("This update is for supporters.")).toBeTruthy();
  });
});
