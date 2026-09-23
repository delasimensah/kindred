import { formatDuration } from "../formatDuration";

describe("formatDuration", () => {
  it("renders minutes and seconds", () => {
    expect(formatDuration(212000)).toBe("3:32");
    expect(formatDuration(0)).toBe("0:00");
  });
});
