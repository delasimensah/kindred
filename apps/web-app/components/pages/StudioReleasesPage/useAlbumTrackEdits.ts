"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

import { generatePeaksFromAudioFile, uploadStudioFile } from "@/utils";

import { ErrorNotification } from "../../feedback/Notification/Notification";
import type { AlbumEditTrackRow } from "./AlbumEditTracksSection";
import type { EditingAlbum } from "./albumEditTypes";

const MAX_AUDIO_BYTES = 250 * 1024 * 1024;

export function useAlbumTrackEdits(editing: EditingAlbum) {
  const generateUploadUrl = useMutation(api.studioTracks.generateUploadUrl);
  const registerAudio = useMutation(api.studioTracks.registerAudio);
  const reorderTracks = useMutation(api.studioReleases.reorderTracks);
  const addTrack = useMutation(api.studioReleases.addTrack);
  const removeTrack = useMutation(api.studioReleases.removeTrack);
  const [tracks, setTracks] = useState<AlbumEditTrackRow[]>(editing.tracks);
  const [isAdding, setIsAdding] = useState(false);
  const [busyTrackId, setBusyTrackId] = useState<Id<"tracks"> | null>(null);

  const onChangeTitle = (trackId: Id<"tracks">, title: string) => {
    setTracks((current) =>
      current.map((track) =>
        track.trackId === trackId ? { ...track, title } : track
      )
    );
  };

  const onMove = async (trackId: Id<"tracks">, direction: -1 | 1) => {
    const index = tracks.findIndex((track) => track.trackId === trackId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= tracks.length) {
      return;
    }
    const next = [...tracks];
    const current = next[index];
    const other = next[swapWith];
    if (current === undefined || other === undefined) {
      return;
    }
    next[index] = other;
    next[swapWith] = current;
    const ordered = next.map((track, position) => ({ ...track, position }));
    setTracks(ordered);
    setBusyTrackId(trackId);
    try {
      await reorderTracks({
        releaseId: editing.releaseId,
        orderedTrackIds: ordered.map((track) => track.trackId),
      });
    } catch (error) {
      setTracks(editing.tracks);
      ErrorNotification({
        title: "Could not reorder",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setBusyTrackId(null);
    }
  };

  const onRemove = async (trackId: Id<"tracks">) => {
    setBusyTrackId(trackId);
    try {
      await removeTrack({ releaseId: editing.releaseId, trackId });
      setTracks((current) =>
        current
          .filter((track) => track.trackId !== trackId)
          .map((track, position) => ({ ...track, position }))
      );
    } catch (error) {
      ErrorNotification({
        title: "Could not remove track",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setBusyTrackId(null);
    }
  };

  const onAdd = async (payload: { title: string; file: File }) => {
    if (payload.file.size > MAX_AUDIO_BYTES) {
      ErrorNotification({
        title: "File too large",
        message: "Audio must be 250MB or smaller.",
      });
      return;
    }
    setIsAdding(true);
    try {
      const generated = await generatePeaksFromAudioFile(payload.file);
      const audioFileId = await uploadStudioFile({
        file: payload.file,
        generateUrl: () => generateUploadUrl({}),
        register: (filePayload) => registerAudio(filePayload),
      });
      const trackId = await addTrack({
        releaseId: editing.releaseId,
        title: payload.title,
        audioFileId,
        durationMs: generated.durationMs,
        peaks: generated.peaks,
      });
      setTracks((current) => [
        ...current,
        {
          trackId,
          title: payload.title.trim() || `Track ${current.length + 1}`,
          position: current.length,
          durationMs: generated.durationMs,
        },
      ]);
    } catch (error) {
      ErrorNotification({
        title: "Could not add track",
        message:
          error instanceof Error
            ? error.message
            : "Try a WAV or MP3 in Chrome or Safari.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return {
    tracks,
    isAdding,
    busyTrackId,
    onChangeTitle,
    onMove,
    onRemove,
    onAdd,
  };
}
