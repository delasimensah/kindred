import { GENRES } from "shared";

import type { UploadFormValues } from "./UploadDetailsColumn";
import { validateUploadForm } from "./uploadFormValidation";

const baseValues = (): UploadFormValues => ({
  title: "Kokrobite Sessions",
  description: "Live on the beach",
  tags: ["highlife"],
  genre: GENRES[0],
  visibility: "public",
  publishMode: "now",
  scheduleDate: null,
  scheduleTime: "18:00",
});

const readyMedia = {
  audioReady: true,
  peaksInProgress: false,
  artworkReady: true,
};

describe("validateUploadForm", () => {
  it("requires title, genre, audio, and cover art for a draft", () => {
    const result = validateUploadForm(
      { ...baseValues(), title: "  " },
      {
        asDraft: true,
        audioReady: false,
        peaksInProgress: false,
        artworkReady: false,
      }
    );
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.title).toMatch(/required/i);
    expect(result.audioError).toMatch(/audio/i);
    expect(result.artworkError).toMatch(/cover/i);
  });

  it("requires a future schedule when publishing with schedule mode", () => {
    const result = validateUploadForm(
      {
        ...baseValues(),
        publishMode: "schedule",
        scheduleDate: null,
        scheduleTime: "",
      },
      { asDraft: false, ...readyMedia }
    );
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.scheduleDate).toBeTruthy();
    expect(result.fieldErrors.scheduleTime).toBeTruthy();
  });

  it("passes a complete publish-now form", () => {
    const result = validateUploadForm(baseValues(), {
      asDraft: false,
      ...readyMedia,
    });
    expect(result).toEqual({
      ok: true,
      fieldErrors: {},
      audioError: null,
      artworkError: null,
    });
  });
});
