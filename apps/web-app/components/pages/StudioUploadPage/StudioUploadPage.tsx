"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@mantine/form";
import { useAction, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { GENRES } from "shared";

import { generatePeaksFromAudioFile, uploadStudioFile } from "@/utils";

import {
  ErrorNotification,
  InfoNotification,
  SuccessNotification,
} from "../../feedback/Notification/Notification";
import ImageCropModal from "../../media/ImageCropModal/ImageCropModal";
import UploadDetailsColumn, {
  combineScheduleDateTime,
  type UploadFormValues,
} from "./UploadDetailsColumn";
import { validateUploadForm } from "./uploadFormValidation";
import UploadMediaColumn from "./UploadMediaColumn";
import UploadPageHeader from "./UploadPageHeader";

const MAX_AUDIO_BYTES = 250 * 1024 * 1024;

function defaultScheduleTime(): string {
  return "18:00";
}

const StudioUploadPage: React.FC = () => {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.studioTracks.generateUploadUrl);
  const registerAudio = useMutation(api.studioTracks.registerAudio);
  const registerArtwork = useMutation(api.studioTracks.registerArtwork);
  const createDraft = useMutation(api.studioTracks.createDraft);
  const publishNow = useMutation(api.studioTracks.publishNow);
  const schedule = useMutation(api.studioTracks.schedule);
  const suggestReleaseCopy = useAction(api.ai.suggestReleaseCopy);

  const [audioName, setAudioName] = useState<string | null>(null);
  const [audioFileId, setAudioFileId] = useState<Id<"files"> | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [peaksProgress, setPeaksProgress] = useState<number | null>(null);
  const [artworkFileId, setArtworkFileId] = useState<Id<"files"> | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropName, setCropName] = useState("artwork.jpg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [artworkError, setArtworkError] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    initialValues: {
      title: "",
      description: "",
      tags: [],
      genre: GENRES[0],
      visibility: "public",
      publishMode: "now",
      scheduleDate: null,
      scheduleTime: defaultScheduleTime(),
    },
  });

  const audioReady =
    audioFileId !== null &&
    peaks !== null &&
    durationMs !== null &&
    peaksProgress === 100;
  const peaksInProgress = peaksProgress !== null && peaksProgress < 100;

  const onAudioPick = async (file: File) => {
    if (file.size > MAX_AUDIO_BYTES) {
      ErrorNotification({
        title: "File too large",
        message: "Audio must be 250MB or smaller.",
      });
      return;
    }
    setAudioError(null);
    setAudioName(file.name);
    setPeaksProgress(8);
    setAudioFileId(null);
    setPeaks(null);
    setDurationMs(null);
    try {
      setPeaksProgress(25);
      const generated = await generatePeaksFromAudioFile(file);
      setPeaksProgress(70);
      setPeaks(generated.peaks);
      setDurationMs(generated.durationMs);
      const fileId = await uploadStudioFile({
        file,
        generateUrl: () => generateUploadUrl({}),
        register: (payload) => registerAudio(payload),
      });
      setAudioFileId(fileId);
      setPeaksProgress(100);
    } catch (error) {
      setPeaksProgress(null);
      setAudioName(null);
      ErrorNotification({
        title: "Could not process audio",
        message:
          error instanceof Error
            ? error.message
            : "Try a WAV or MP3 in Chrome or Safari.",
      });
    }
  };

  const onArtworkCropped = async (file: File) => {
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(null);
    setArtworkError(null);
    try {
      const preview = URL.createObjectURL(file);
      setArtworkPreview(preview);
      const fileId = await uploadStudioFile({
        file,
        generateUrl: () => generateUploadUrl({}),
        register: (payload) => registerArtwork(payload),
      });
      setArtworkFileId(fileId);
    } catch (error) {
      ErrorNotification({
        title: "Artwork upload failed",
        message:
          error instanceof Error ? error.message : "Try another image file.",
      });
    }
  };

  const onSuggest = async () => {
    setIsSuggesting(true);
    try {
      const suggestion = await suggestReleaseCopy({
        title: form.values.title,
        genre: form.values.genre,
      });
      if (suggestion === null) {
        InfoNotification({
          title: "Suggestions unavailable",
          message: "Fill tags and description yourself for now.",
        });
        return;
      }
      if (suggestion.tags.length === 0 && suggestion.description.length === 0) {
        InfoNotification({
          title: "Suggestions unavailable",
          message: "Fill tags and description yourself for now.",
        });
        return;
      }
      form.setFieldValue("tags", suggestion.tags);
      form.setFieldValue("description", suggestion.description);
      form.clearFieldError("tags");
      form.clearFieldError("description");
    } catch {
      InfoNotification({
        title: "Suggestions unavailable",
        message: "Fill tags and description yourself for now.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const saveRelease = async (values: UploadFormValues, asDraft: boolean) => {
    if (
      audioFileId === null ||
      artworkFileId === null ||
      peaks === null ||
      durationMs === null ||
      peaksProgress !== 100
    ) {
      return;
    }
    const publishAt =
      values.publishMode === "schedule"
        ? combineScheduleDateTime(values.scheduleDate, values.scheduleTime)
        : null;
    setIsSubmitting(true);
    try {
      const trackId = await createDraft({
        title: values.title,
        audioFileId,
        artworkFileId,
        visibility: values.visibility,
        durationMs,
        peaks,
        tags: values.tags,
        description: values.description || undefined,
        genre: values.genre,
      });
      if (!asDraft) {
        if (values.publishMode === "now") {
          await publishNow({ trackId });
        } else if (publishAt) {
          await schedule({
            trackId,
            publishAt: publishAt.getTime(),
          });
        }
      }
      SuccessNotification({
        title: asDraft
          ? "Draft saved"
          : values.publishMode === "now"
            ? "Published"
            : "Scheduled",
        message: asDraft
          ? "You can finish publishing from Releases."
          : "Your release is on the Releases list.",
      });
      router.push("/releases");
    } catch (error) {
      ErrorNotification({
        title: "Could not save release",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAttemptSubmit = (asDraft: boolean) => {
    form.clearErrors();
    setAudioError(null);
    setArtworkError(null);
    const result = validateUploadForm(form.values, {
      asDraft,
      audioReady,
      peaksInProgress,
      artworkReady: artworkFileId !== null,
    });
    if (!result.ok) {
      form.setErrors(result.fieldErrors);
      setAudioError(result.audioError);
      setArtworkError(result.artworkError);
      ErrorNotification({
        title: "Check the form",
        message: "Fix the highlighted fields, then try again.",
      });
      return;
    }
    void saveRelease(form.values, asDraft);
  };

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      {cropSrc ? (
        <ImageCropModal
          key={cropSrc}
          opened
          imageSrc={cropSrc}
          fileName={cropName}
          kind="avatar"
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onConfirm={(file) => {
            void onArtworkCropped(file);
          }}
        />
      ) : null}

      <UploadPageHeader
        isSubmitting={isSubmitting}
        onSaveDraft={() => onAttemptSubmit(true)}
        onPublish={() => onAttemptSubmit(false)}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <UploadMediaColumn
          audioName={audioName}
          peaksProgress={peaksProgress}
          artworkPreview={artworkPreview}
          audioError={audioError}
          artworkError={artworkError}
          onPickAudio={(file) => void onAudioPick(file)}
          onPickArtwork={(file) => {
            if (cropSrc) {
              URL.revokeObjectURL(cropSrc);
            }
            setCropName(file.name);
            setCropSrc(URL.createObjectURL(file));
          }}
        />
        <UploadDetailsColumn
          form={form}
          isSuggesting={isSuggesting}
          onSuggest={() => void onSuggest()}
        />
      </div>
    </div>
  );
};

export default StudioUploadPage;
