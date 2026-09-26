import {
  artistShareCents,
  formatUsdFromCents,
  periodKey,
  previousPeriodKey,
  TIER_CENTS,
} from "../earnings";

describe("earnings constants", () => {
  it("splits the artist pool equally across routed artists", () => {
    expect(artistShareCents(TIER_CENTS["4.99"], 1)).toBe(349);
    expect(artistShareCents(TIER_CENTS["4.99"], 2)).toBe(174);
    expect(artistShareCents(TIER_CENTS["9.99"], 3)).toBe(233);
  });

  it("formats cents as USD", () => {
    expect(formatUsdFromCents(48200)).toBe("$482.00");
  });

  it("builds UTC period keys", () => {
    expect(periodKey(new Date(Date.UTC(2026, 8, 26)))).toBe("2026-09");
    expect(previousPeriodKey(new Date(Date.UTC(2026, 8, 26)))).toBe("2026-08");
  });
});
