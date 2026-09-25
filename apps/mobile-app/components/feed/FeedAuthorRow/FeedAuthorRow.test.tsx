import { fireEvent, render, screen } from "@testing-library/react-native";

import FeedAuthorRow from "./FeedAuthorRow";

describe("FeedAuthorRow", () => {
  it("opens the artist", () => {
    const onPress = jest.fn();
    render(
      <FeedAuthorRow
        name="Sela Okoro"
        avatarUrl={null}
        meta="Yesterday · Voice note"
        onPress={onPress}
      />
    );
    fireEvent.press(screen.getByLabelText("Open Sela Okoro"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Yesterday · Voice note")).toBeTruthy();
  });
});
