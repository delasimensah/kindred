import { fireEvent, render, screen } from "@testing-library/react-native";

import CollectionEmptyState from "./CollectionEmptyState";

describe("CollectionEmptyState", () => {
  it("shows the title and runs the action", () => {
    const onAction = jest.fn();
    render(
      <CollectionEmptyState
        icon="disc"
        title="No playlists yet"
        subtitle="Start collecting the tracks you love."
        actionLabel="Create playlist"
        onAction={onAction}
      />
    );
    expect(screen.getByText("No playlists yet")).toBeTruthy();
    expect(
      screen.getByText("Start collecting the tracks you love.")
    ).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Create playlist"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
