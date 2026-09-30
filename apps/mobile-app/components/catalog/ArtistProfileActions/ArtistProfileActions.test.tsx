import { fireEvent, render, screen } from "@testing-library/react-native";

import ArtistProfileActions from "./ArtistProfileActions";

describe("ArtistProfileActions", () => {
  it("follows and offers support", () => {
    const onToggleFollow = jest.fn();
    const onSupport = jest.fn();
    render(
      <ArtistProfileActions
        name="Amaara Mensah"
        isFollowed={false}
        isSupporting={false}
        onToggleFollow={onToggleFollow}
        onSupport={onSupport}
      />
    );
    fireEvent.press(screen.getByLabelText("Follow Amaara Mensah"));
    fireEvent.press(screen.getByLabelText("Support Amaara Mensah"));
    expect(onToggleFollow).toHaveBeenCalledTimes(1);
    expect(onSupport).toHaveBeenCalledTimes(1);
  });

  it("shows Supporting once this artist is in the route", () => {
    render(
      <ArtistProfileActions
        name="Amaara Mensah"
        isFollowed
        isSupporting
        onToggleFollow={jest.fn()}
        onSupport={jest.fn()}
      />
    );
    expect(screen.getByLabelText("Supporting Amaara Mensah")).toBeTruthy();
    expect(screen.getByText("Supporting")).toBeTruthy();
  });
});
