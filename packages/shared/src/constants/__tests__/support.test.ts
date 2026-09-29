import {
  FOUNDING_SUPPORTER_LIMIT,
  isFoundingSupporter,
  SUPPORTER_ENTITLEMENT,
  SUPPORTER_PRODUCT_499,
  SUPPORTER_PRODUCT_999,
} from "../support";

describe("supporter products", () => {
  it("uses one entitlement id and two monthly product ids", () => {
    expect(SUPPORTER_ENTITLEMENT).toBe("supporter");
    expect(SUPPORTER_PRODUCT_499).not.toBe(SUPPORTER_PRODUCT_999);
  });
});

describe("founding supporter", () => {
  it("is earned only by the first routes to that artist", () => {
    expect(isFoundingSupporter(0)).toBe(true);
    expect(isFoundingSupporter(FOUNDING_SUPPORTER_LIMIT - 1)).toBe(true);
    expect(isFoundingSupporter(FOUNDING_SUPPORTER_LIMIT)).toBe(false);
  });
});
