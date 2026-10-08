import { fireEvent, render, screen } from "@testing-library/react-native";

import VisualizerToggle from "./VisualizerToggle";

describe("VisualizerToggle", () => {
  it("starts off and turns on when tapped", () => {
    const onChange = jest.fn();
    render(
      <VisualizerToggle enabled={false} lowPower={false} onChange={onChange} />
    );
    fireEvent.press(screen.getByLabelText("Visualizer"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("stays off while Low Power Mode is on", () => {
    const onChange = jest.fn();
    render(<VisualizerToggle enabled lowPower onChange={onChange} />);
    const toggle = screen.getByLabelText("Visualizer");
    expect(toggle.props.accessibilityState).toMatchObject({
      checked: false,
      disabled: true,
    });
    fireEvent.press(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });
});
