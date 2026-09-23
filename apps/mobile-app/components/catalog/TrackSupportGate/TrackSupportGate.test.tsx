import { fireEvent, render, screen } from "@testing-library/react-native";

import TrackSupportGate from "./TrackSupportGate";

describe("TrackSupportGate", () => {
  it("offers support without starting checkout itself", () => {
    const onSupport = jest.fn();
    render(
      <TrackSupportGate artistName="Amaara Mensah" onSupport={onSupport} />
    );
    expect(screen.getByText("This is for supporters")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Support Amaara Mensah"));
    fireEvent.press(screen.getByLabelText("See plans"));
    expect(onSupport).toHaveBeenCalledTimes(2);
  });
});
