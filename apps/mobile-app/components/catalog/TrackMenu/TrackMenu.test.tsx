import { fireEvent, render, screen } from "@testing-library/react-native";

import TrackMenu from "./TrackMenu";

describe("TrackMenu", () => {
  it("likes the track", () => {
    const onToggleLike = jest.fn();
    render(
      <TrackMenu title="Asase" trackId="tr_asase" onToggleLike={onToggleLike} />
    );
    fireEvent.press(screen.getByLabelText("Like Asase"));
    expect(onToggleLike).toHaveBeenCalledTimes(1);
  });
});
