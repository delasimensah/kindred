import { FOUNDING_SUPPORTER_LIMIT, isFoundingSupporter } from "../support";

describe("founding supporter", () => {
  it("is earned only by the first routes to that artist", () => {
    expect(isFoundingSupporter(0)).toBe(true);
    expect(isFoundingSupporter(FOUNDING_SUPPORTER_LIMIT - 1)).toBe(true);
    expect(isFoundingSupporter(FOUNDING_SUPPORTER_LIMIT)).toBe(false);
  });
});
