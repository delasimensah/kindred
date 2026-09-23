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
        onToggleFollow={onToggleFollow}
        onSupport={onSupport}
      />
    );
    fireEvent.press(screen.getByLabelText("Follow Amaara Mensah"));
    fireEvent.press(screen.getByLabelText("Support Amaara Mensah"));
    expect(onToggleFollow).toHaveBeenCalledTimes(1);
    expect(onSupport).toHaveBeenCalledTimes(1);
  });
});
