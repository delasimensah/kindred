import { fireEvent, render, screen } from "@testing-library/react-native";

import LockedUpdateShell from "./LockedUpdateShell";

describe("LockedUpdateShell", () => {
  it("offers support without the post body", () => {
    const onSupport = jest.fn();
    render(
      <LockedUpdateShell artistName="Kweku Darko" onSupport={onSupport} />
    );
    expect(
      screen.getByText("This post is exclusive to Kweku Darko's supporters")
    ).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Support Kweku Darko to unlock"));
    expect(onSupport).toHaveBeenCalledTimes(1);
  });
});
