import { fireEvent, render, screen } from "@testing-library/react-native";

import PaywallSheet from "./PaywallSheet";

const baseProps = {
  selectedPlanId: "supporter_monthly_999",
  onSelectPlan: jest.fn(),
  onRestore: jest.fn(),
  onClose: jest.fn(),
  subscribing: false,
  restoring: false,
  notice: null,
};

describe("PaywallSheet", () => {
  it("lists the benefits once and shows what each price sends to artists", () => {
    const onSubscribe = jest.fn();
    render(<PaywallSheet {...baseProps} onSubscribe={onSubscribe} />);

    expect(screen.getByText("Back the artists you believe in.")).toBeTruthy();
    expect(screen.getByText("Supporter")).toBeTruthy();
    expect(screen.getByText("Champion")).toBeTruthy();
    expect(screen.getByText("Most supportive")).toBeTruthy();
    expect(screen.getByText("$4.99")).toBeTruthy();
    expect(screen.getByText("$9.99")).toBeTruthy();
    expect(screen.getByText("$3.49 a month to your artists")).toBeTruthy();
    expect(screen.getByText("$6.99 a month to your artists")).toBeTruthy();
    expect(screen.getAllByText("Exclusives from routed artists")).toHaveLength(
      1
    );
    fireEvent.press(screen.getByText("Subscribe"));
    expect(onSubscribe).toHaveBeenCalledTimes(1);
  });

  it("names the artist when opened from their page", () => {
    render(
      <PaywallSheet
        {...baseProps}
        onSubscribe={jest.fn()}
        artist={{ name: "Amaara", avatarUrl: null }}
      />
    );

    expect(screen.getByText("Support Amaara")).toBeTruthy();
  });

  it("holds the headline until the artist name arrives", () => {
    render(
      <PaywallSheet {...baseProps} onSubscribe={jest.fn()} artistLoading />
    );

    expect(screen.getByLabelText("Loading artist")).toBeTruthy();
    expect(screen.queryByText("Back the artists you believe in.")).toBeNull();
    expect(screen.getByText("Subscribe")).toBeTruthy();
  });
});
