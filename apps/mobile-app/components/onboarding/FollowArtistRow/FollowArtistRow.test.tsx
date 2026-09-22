import { fireEvent, render, screen } from "@testing-library/react-native";

import FollowArtistRow from "./FollowArtistRow";

describe("FollowArtistRow", () => {
  it("follows from the Follow pill", () => {
    const onToggle = jest.fn();
    render(
      <FollowArtistRow
        name="Amaara Mensah"
        bio="Afro-soul and R&B · Accra"
        isFollowed={false}
        onToggle={onToggle}
      />
    );
    fireEvent.press(screen.getByLabelText("Follow Amaara Mensah"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
