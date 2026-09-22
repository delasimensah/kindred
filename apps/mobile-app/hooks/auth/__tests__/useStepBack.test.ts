import { renderHook } from "@testing-library/react-native";
import { BackHandler } from "react-native";

import { useStepBack } from "../useStepBack";

describe("useStepBack", () => {
  it("swallows hardware back when a step can go back", () => {
    const onBack = jest.fn();
    let hardwareBack: () => boolean = () => false;
    const addEventListener = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, handler) => {
        hardwareBack = handler as () => boolean;
        return { remove: jest.fn() };
      });

    renderHook(() => useStepBack(true, onBack));
    expect(hardwareBack()).toBe(true);
    expect(onBack).toHaveBeenCalledTimes(1);

    addEventListener.mockRestore();
  });
});
