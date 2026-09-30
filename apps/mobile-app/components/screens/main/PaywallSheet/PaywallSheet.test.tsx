import { fireEvent, render, screen } from "@testing-library/react-native";

import PaywallSheet from "./PaywallSheet";

describe("PaywallSheet", () => {
  it("shows both prices with the same benefits", () => {
    const onSubscribe = jest.fn();
    render(
      <PaywallSheet
        selectedPlanId="supporter_monthly_999"
        onSelectPlan={jest.fn()}
        onSubscribe={onSubscribe}
        onRestore={jest.fn()}
        onClose={jest.fn()}
        subscribing={false}
        restoring={false}
        notice={null}
      />
    );

    expect(screen.getByText("Back the artists you believe in.")).toBeTruthy();
    expect(screen.getByText("Supporter")).toBeTruthy();
    expect(screen.getByText("Champion")).toBeTruthy();
    expect(screen.getByText("Most supportive")).toBeTruthy();
    expect(screen.getByText("$4.99")).toBeTruthy();
    expect(screen.getByText("$9.99")).toBeTruthy();
    expect(screen.getAllByText("Exclusives from routed artists")).toHaveLength(
      2
    );
    expect(
      screen.getAllByText("Offline listening for entitled tracks")
    ).toHaveLength(2);
    expect(screen.getAllByText("See your impact on artists")).toHaveLength(2);
    expect(
      screen.getByText(
        "Both plans unlock the exact same features — a higher tier simply sends more support to the artists you route to."
      )
    ).toBeTruthy();
    expect(
      screen.getByText("Cancel anytime. Renews automatically until cancelled.")
    ).toBeTruthy();
    fireEvent.press(screen.getByText("Subscribe"));
    expect(onSubscribe).toHaveBeenCalledTimes(1);
  });
});
