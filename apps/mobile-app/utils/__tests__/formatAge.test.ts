import { formatAge } from "../formatAge";

describe("formatAge", () => {
  const now = new Date(2026, 8, 23, 12, 0, 0).getTime();

  it("labels recent updates", () => {
    expect(formatAge(now - 30_000, now)).toBe("Just now");
    expect(formatAge(now - 2 * 60 * 60 * 1000, now)).toBe("2h ago");
    expect(formatAge(now - 3 * 24 * 60 * 60 * 1000, now)).toBe("3d ago");
  });

  it("shows a date once an update is a week old", () => {
    expect(formatAge(new Date(2026, 1, 12, 9).getTime(), now)).toBe("12 Feb");
    expect(formatAge(new Date(2025, 10, 3, 9).getTime(), now)).toBe(
      "3 Nov 2025"
    );
  });
});
