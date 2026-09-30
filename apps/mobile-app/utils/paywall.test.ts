import { canUseTestStore, storeSubscriptionsUrl } from "./paywall";

describe("canUseTestStore", () => {
  it("allows the practice shop only on the development app", () => {
    expect(canUseTestStore("com.dmstudios.kindred.dev")).toBe(true);
    expect(canUseTestStore("com.dmstudios.kindred.staging")).toBe(false);
    expect(canUseTestStore("com.dmstudios.kindred")).toBe(false);
    expect(canUseTestStore(undefined)).toBe(false);
  });

  it("points manage-subscription at the phone store", () => {
    expect(storeSubscriptionsUrl("ios")).toBe(
      "https://apps.apple.com/account/subscriptions"
    );
    expect(storeSubscriptionsUrl("android")).toBe(
      "https://play.google.com/store/account/subscriptions"
    );
  });
});
