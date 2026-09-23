import { formatAge } from "../formatAge";

describe("formatAge", () => {
  const now = Date.UTC(2026, 8, 23, 12, 0, 0);

  it("labels recent updates", () => {
    expect(formatAge(now - 30_000, now)).toBe("Just now");
    expect(formatAge(now - 2 * 60 * 60 * 1000, now)).toBe("2h ago");
    expect(formatAge(now - 3 * 24 * 60 * 60 * 1000, now)).toBe("3d ago");
  });
});
