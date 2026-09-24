import { fireEvent, render, screen } from "@testing-library/react-native";

import ArtistUpdateCard from "./ArtistUpdateCard";

describe("ArtistUpdateCard", () => {
  it("shows public text and a lock with support for supporters", () => {
    const onSupport = jest.fn();
    const { rerender } = render(
      <ArtistUpdateCard
        artistName="Amaara Mensah"
        whenLabel="2h ago"
        audienceLabel="Public"
        body="Asase is finished."
        locked={false}
        onSupport={onSupport}
      />
    );
    expect(screen.getByText("Asase is finished.")).toBeTruthy();
    expect(screen.getByText("2h ago · Public")).toBeTruthy();

    rerender(
      <ArtistUpdateCard
        artistName="Amaara Mensah"
        whenLabel="1d ago"
        audienceLabel="Supporters only"
        body={null}
        locked
        onSupport={onSupport}
      />
    );
    fireEvent.press(screen.getByLabelText("Support Amaara Mensah to unlock"));
    expect(onSupport).toHaveBeenCalledTimes(1);
  });
});
