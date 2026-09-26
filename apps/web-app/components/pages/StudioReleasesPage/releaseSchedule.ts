import { combineScheduleDateTime } from "../StudioUploadPage/UploadDetailsColumn";

const SCHEDULE_LEAD_MS = 15_000;

/** Split a publishAt ms into DateInput + TimePicker values. */
export function splitPublishAt(ms: number | null): {
  scheduleDate: string | null;
  scheduleTime: string;
} {
  if (ms === null) {
    return { scheduleDate: null, scheduleTime: "18:00" };
  }
  const when = new Date(ms);
  const year = when.getFullYear();
  const month = String(when.getMonth() + 1).padStart(2, "0");
  const day = String(when.getDate()).padStart(2, "0");
  const hours = String(when.getHours()).padStart(2, "0");
  const minutes = String(when.getMinutes()).padStart(2, "0");
  return {
    scheduleDate: `${year}-${month}-${day}`,
    scheduleTime: `${hours}:${minutes}`,
  };
}

export type ScheduleFormValues = {
  scheduleDate: string | null;
  scheduleTime: string;
};

/** Validate schedule fields; returns publishAt ms or field errors. */
export function validateScheduleForm(
  values: ScheduleFormValues,
  nowMs: number
):
  | { ok: true; publishAtMs: number }
  | { ok: false; errors: Partial<Record<keyof ScheduleFormValues, string>> } {
  const errors: Partial<Record<keyof ScheduleFormValues, string>> = {};
  if (values.scheduleDate === null || values.scheduleDate.length === 0) {
    errors.scheduleDate = "Pick a date";
  }
  if (values.scheduleTime.trim().length === 0) {
    errors.scheduleTime = "Pick a time";
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  const publishAt = combineScheduleDateTime(
    values.scheduleDate,
    values.scheduleTime
  );
  if (publishAt === null) {
    return {
      ok: false,
      errors: { scheduleDate: "Pick a valid date and time" },
    };
  }
  if (publishAt.getTime() <= nowMs + SCHEDULE_LEAD_MS) {
    return {
      ok: false,
      errors: {
        scheduleTime: "Pick a time at least 15 seconds from now",
      },
    };
  }
  return { ok: true, publishAtMs: publishAt.getTime() };
}

/** Validate then call onConfirm; returns false when field errors were set. */
export function submitScheduleForm(
  values: ScheduleFormValues,
  onConfirm: (publishAtMs: number) => void,
  setErrors: (errors: Partial<Record<keyof ScheduleFormValues, string>>) => void
): boolean {
  const result = validateScheduleForm(values, Date.now());
  if (!result.ok) {
    setErrors(result.errors);
    return false;
  }
  onConfirm(result.publishAtMs);
  return true;
}
