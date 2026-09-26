"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  type ActiveVoiceRecorder,
  formatVoiceDuration,
  generateVoicePeaksFromAudioFile,
  getConvexErrorMessage,
  getVoiceRecorderSupport,
  showErrorNotification,
  showSuccessNotification,
  startVoiceRecording,
  uploadStudioFile,
} from "@/utils";

const BODY_MAX = 500;
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export type Audience = "everyone" | "supporters";

type PhotoDraft = {
  file: File;
  previewUrl: string;
};

type VoiceDraft = {
  file: File;
  objectUrl: string;
  durationMs: number;
  peaks: number[];
};

export function useUpdateComposer(editPostId: Id<"updatePosts"> | null) {
  const router = useRouter();
  const existing = useQuery(
    api.posts.getMine,
    editPostId === null ? "skip" : { postId: editPostId }
  );
  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const registerPhoto = useMutation(api.posts.registerPhoto);
  const registerVoice = useMutation(api.posts.registerVoice);

  const [audience, setAudience] = useState<Audience>("everyone");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<PhotoDraft | null>(null);
  const [voice, setVoice] = useState<VoiceDraft | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [existingVoiceLabel, setExistingVoiceLabel] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [activeRecorder, setActiveRecorder] =
    useState<ActiveVoiceRecorder | null>(null);
  const hydratedFor = useRef<string | null>(null);

  const voiceSupport = useMemo(() => getVoiceRecorderSupport(), []);
  const isEditing = editPostId !== null;

  useEffect(() => {
    if (existing === undefined || existing === null || editPostId === null) {
      return;
    }
    if (hydratedFor.current === editPostId) {
      return;
    }
    hydratedFor.current = editPostId;
    setAudience(existing.audience);
    setBody(existing.body);
    setExistingPhotoUrl(existing.photoUrl);
    setExistingVoiceLabel(
      existing.hasVoice && existing.voiceDurationMs !== null
        ? `Voice note · ${formatVoiceDuration(existing.voiceDurationMs)}`
        : null
    );
  }, [existing, editPostId]);

  useEffect(() => {
    return () => {
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      if (voice?.objectUrl) {
        URL.revokeObjectURL(voice.objectUrl);
      }
      activeRecorder?.cancel();
    };
    // Only on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      setRecordingMs(Date.now() - started);
    }, 250);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  const canPost = body.trim().length > 0 && !isSubmitting && !isRecording;

  const clearPhoto = () => {
    setPhoto((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
    setExistingPhotoUrl(null);
  };

  const clearVoice = () => {
    setVoice((current) => {
      if (current?.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }
      return null;
    });
    setExistingVoiceLabel(null);
  };

  const onPickPhoto = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showErrorNotification("Choose a JPG or PNG photo.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      showErrorNotification("Photo must be 10MB or smaller.");
      return;
    }
    clearPhoto();
    setPhoto({ file, previewUrl: URL.createObjectURL(file) });
  };

  const onToggleRecord = async () => {
    if (isRecording && activeRecorder) {
      try {
        const recording = await activeRecorder.stop();
        setActiveRecorder(null);
        setIsRecording(false);
        setRecordingMs(0);
        const decoded = await generateVoicePeaksFromAudioFile(recording.file);
        clearVoice();
        setVoice({
          file: recording.file,
          objectUrl: recording.objectUrl,
          durationMs: decoded.durationMs,
          peaks: decoded.peaks,
        });
      } catch (error) {
        setActiveRecorder(null);
        setIsRecording(false);
        setRecordingMs(0);
        showErrorNotification(
          getConvexErrorMessage(error, "Could not finish recording.")
        );
      }
      return;
    }

    try {
      clearVoice();
      const recorder = await startVoiceRecording();
      setActiveRecorder(recorder);
      setIsRecording(true);
      setRecordingMs(0);
    } catch (error) {
      showErrorNotification(
        getConvexErrorMessage(
          error,
          "Could not start recording. Check microphone permission."
        )
      );
    }
  };

  const onPost = async () => {
    if (!canPost) {
      return;
    }
    setIsSubmitting(true);
    try {
      let photoFileId: Id<"files"> | undefined;
      if (photo) {
        photoFileId = await uploadStudioFile({
          file: photo.file,
          generateUrl: () => generateUploadUrl({}),
          register: (payload) => registerPhoto(payload),
        });
      }

      let voiceFileId: Id<"files"> | undefined;
      let voiceDurationMs: number | undefined;
      let voicePeaks: number[] | undefined;
      if (voice) {
        voiceFileId = await uploadStudioFile({
          file: voice.file,
          generateUrl: () => generateUploadUrl({}),
          register: (payload) => registerVoice(payload),
        });
        voiceDurationMs = voice.durationMs;
        voicePeaks = voice.peaks;
      }

      if (editPostId !== null) {
        const hadPhoto = existing?.hasPhoto === true;
        const hadVoice = existing?.hasVoice === true;
        await updatePost({
          postId: editPostId,
          body,
          audience,
          ...(photoFileId === undefined ? {} : { photoFileId }),
          ...(photoFileId === undefined && hadPhoto && existingPhotoUrl === null
            ? { removePhoto: true }
            : {}),
          ...(voiceFileId === undefined
            ? {}
            : { voiceFileId, voiceDurationMs, voicePeaks }),
          ...(voiceFileId === undefined &&
          hadVoice &&
          existingVoiceLabel === null
            ? { removeVoice: true }
            : {}),
        });
        showSuccessNotification("Update saved.");
      } else {
        await createPost({
          body,
          audience,
          ...(photoFileId === undefined ? {} : { photoFileId }),
          ...(voiceFileId === undefined
            ? {}
            : { voiceFileId, voiceDurationMs, voicePeaks }),
        });
        showSuccessNotification("Update posted.");
      }
      router.push("/updates");
    } catch (error) {
      showErrorNotification(
        getConvexErrorMessage(
          error,
          isEditing ? "Could not save update." : "Could not post update."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const voiceLabel =
    voice !== null
      ? `Voice note · ${formatVoiceDuration(voice.durationMs)}`
      : existingVoiceLabel;

  const photoPreviewUrl = photo?.previewUrl ?? existingPhotoUrl;

  return {
    BODY_MAX,
    isEditing,
    existingStatus:
      editPostId === null
        ? ("ready" as const)
        : existing === undefined
          ? ("loading" as const)
          : existing === null
            ? ("missing" as const)
            : ("ready" as const),
    audience,
    setAudience,
    body,
    setBody,
    photo,
    voice,
    photoPreviewUrl,
    voiceLabel,
    isSubmitting,
    isRecording,
    recordingMs,
    voiceSupport,
    canPost,
    clearPhoto,
    clearVoice,
    onPickPhoto,
    onToggleRecord,
    onPost,
  };
}
