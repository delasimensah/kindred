import { splitPublishAt, validateScheduleForm } from "./releaseSchedule";

describe("splitPublishAt", () => {
  it("returns empty date defaults when publishAt is null", () => {
    expect(splitPublishAt(null)).toEqual({
      scheduleDate: null,
      scheduleTime: "18:00",
    });
  });

  it("splits a timestamp into local date and time", () => {
    const when = new Date(2026, 5, 21, 18, 30, 0);
    expect(splitPublishAt(when.getTime())).toEqual({
      scheduleDate: "2026-06-21",
      scheduleTime: "18:30",
    });
  });
});

describe("validateScheduleForm", () => {
  it("requires a future date and time", () => {
    const now = new Date(2026, 5, 21, 12, 0, 0).getTime();
    const result = validateScheduleForm(
      { scheduleDate: "2026-06-21", scheduleTime: "12:00" },
      now
    );
    expect(result.ok).toBe(false);
  });

  it("accepts a time far enough ahead", () => {
    const now = new Date(2026, 5, 21, 12, 0, 0).getTime();
    const result = validateScheduleForm(
      { scheduleDate: "2026-06-21", scheduleTime: "18:00" },
      now
    );
    expect(result).toEqual({
      ok: true,
      publishAtMs: new Date(2026, 5, 21, 18, 0, 0).getTime(),
    });
  });
});
