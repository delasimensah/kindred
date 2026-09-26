import { isGenre } from "shared";

import {
  combineScheduleDateTime,
  type UploadFormValues,
} from "./UploadDetailsColumn";

/** Match `convex/studioTracks` limits so the UI fails before the server. */
export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;
export const MAX_TAGS = 12;
export const TAG_MAX = 32;

/** Server schedule rejects times within ~15s; keep the same floor here. */
const SCHEDULE_LEAD_MS = 15_000;

export type UploadValidationOptions = {
  asDraft: boolean;
  audioReady: boolean;
  peaksInProgress: boolean;
  artworkReady: boolean;
};

export type UploadValidationResult = {
  ok: boolean;
  fieldErrors: Partial<Record<keyof UploadFormValues, string>>;
  audioError: string | null;
  artworkError: string | null;
};

/** Field + media checks for Save draft / Publish or schedule. */
export function validateUploadForm(
  values: UploadFormValues,
  options: UploadValidationOptions
): UploadValidationResult {
  const fieldErrors: UploadValidationResult["fieldErrors"] = {};

  const title = values.title.trim();
  if (title.length === 0) {
    fieldErrors.title = "Title is required";
  } else if (title.length > TITLE_MAX) {
    fieldErrors.title = `Title must be ${TITLE_MAX} characters or fewer`;
  }

  if (!isGenre(values.genre)) {
    fieldErrors.genre = "Pick a genre from the list";
  }

  const description = values.description.trim();
  if (description.length > DESCRIPTION_MAX) {
    fieldErrors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
  }

  if (values.tags.length > MAX_TAGS) {
    fieldErrors.tags = `At most ${MAX_TAGS} tags`;
  } else if (values.tags.some((tag) => tag.trim().length > TAG_MAX)) {
    fieldErrors.tags = `Each tag must be ${TAG_MAX} characters or fewer`;
  }

  if (!options.asDraft && values.publishMode === "schedule") {
    if (values.scheduleDate === null || values.scheduleDate.length === 0) {
      fieldErrors.scheduleDate = "Pick a date";
    }
    if (values.scheduleTime.trim().length === 0) {
      fieldErrors.scheduleTime = "Pick a time";
    }
    if (
      fieldErrors.scheduleDate === undefined &&
      fieldErrors.scheduleTime === undefined
    ) {
      const publishAt = combineScheduleDateTime(
        values.scheduleDate,
        values.scheduleTime
      );
      if (publishAt === null) {
        fieldErrors.scheduleDate = "Pick a valid date and time";
      } else if (publishAt.getTime() <= Date.now() + SCHEDULE_LEAD_MS) {
        fieldErrors.scheduleTime = "Pick a time at least 15 seconds from now";
      }
    }
  }

  let audioError: string | null = null;
  if (!options.audioReady) {
    audioError = options.peaksInProgress
      ? "Wait for peaks to finish"
      : "Upload an audio file";
  }

  const artworkError = options.artworkReady
    ? null
    : "Add cover art for this release";

  return {
    ok:
      Object.keys(fieldErrors).length === 0 &&
      audioError === null &&
      artworkError === null,
    fieldErrors,
    audioError,
    artworkError,
  };
}
