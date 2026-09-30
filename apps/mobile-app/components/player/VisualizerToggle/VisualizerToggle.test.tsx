import { fireEvent, render, screen } from "@testing-library/react-native";

import VisualizerToggle from "./VisualizerToggle";

describe("VisualizerToggle", () => {
  it("starts off and turns on when tapped", () => {
    const onChange = jest.fn();
    render(
      <VisualizerToggle enabled={false} lowPower={false} onChange={onChange} />
    );
    fireEvent(screen.getByLabelText("Visualizer"), "valueChange", true);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("stays off while Low Power Mode is on", () => {
    const onChange = jest.fn();
    render(<VisualizerToggle enabled lowPower onChange={onChange} />);
    const toggle = screen.getByLabelText("Visualizer");
    expect(toggle.props.value).toBe(false);
    expect(toggle.props.disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
});
