"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

import {
  getConvexErrorMessage,
  showErrorNotification,
  showSuccessNotification,
} from "@/utils";

export function useCatalogModeration() {
  const setHidden = useMutation(api.admin.setHidden);
  const deleteTrack = useMutation(api.admin.removeTrack);
  const [busyId, setBusyId] = useState<string | null>(null);

  function run(
    id: string,
    work: Promise<null>,
    success: string,
    title: string
  ) {
    setBusyId(id);
    void work
      .then(() => {
        showSuccessNotification(success, title);
      })
      .catch((error: unknown) => {
        showErrorNotification(getConvexErrorMessage(error));
      })
      .finally(() => {
        setBusyId(null);
      });
  }

  return {
    busyId,
    hideTrack(trackId: string, hidden: boolean) {
      run(
        trackId,
        setHidden({
          target: { kind: "track", id: trackId as Id<"tracks"> },
          hidden,
        }),
        hidden
          ? "Fans no longer see this track."
          : "Fans can see this track again.",
        hidden ? "Track hidden" : "Track visible"
      );
    },
    hideArtist(artistId: string, hidden: boolean) {
      run(
        artistId,
        setHidden({
          target: { kind: "artist", id: artistId as Id<"artists"> },
          hidden,
        }),
        hidden
          ? "Fans no longer see this artist."
          : "Fans can see this artist again.",
        hidden ? "Artist hidden" : "Artist visible"
      );
    },
    hideRelease(releaseId: string, hidden: boolean) {
      run(
        releaseId,
        setHidden({
          target: { kind: "release", id: releaseId as Id<"releases"> },
          hidden,
        }),
        hidden
          ? "Fans no longer see this release or its tracks."
          : "Fans can see this release again.",
        hidden ? "Release hidden" : "Release visible"
      );
    },
    removeTrack(trackId: string) {
      run(
        trackId,
        deleteTrack({ trackId: trackId as Id<"tracks"> }),
        "It is gone from fan lists and playlists.",
        "Track removed"
      );
    },
  };
}
