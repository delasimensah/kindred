import { tapHaptic } from "../haptics";

jest.mock("expo-haptics", () => {
  throw new Error("missing native module");
});

describe("tapHaptic", () => {
  it("does nothing when this install has no haptics module", async () => {
    await expect(tapHaptic("select")).resolves.toBeUndefined();
  });
});
