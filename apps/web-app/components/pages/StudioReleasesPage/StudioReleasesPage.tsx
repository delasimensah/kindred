"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@mantine/core";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import React, { useState } from "react";

import {
  ErrorNotification,
  SuccessNotification,
} from "../../feedback/Notification/Notification";
import Text from "../../ui/Text/Text";
import ReleaseEditModal from "./ReleaseEditModal";
import ReleaseRowActions from "./ReleaseRowActions";
import ReleaseScheduleModal from "./ReleaseScheduleModal";
import ReleasesPageHeader, { type Filter } from "./ReleasesPageHeader";
import ReleasesPageSkeleton from "./ReleasesPageSkeleton";

type ScheduleTarget = {
  trackId: Id<"tracks">;
  mode: "schedule" | "change";
  publishAt: number | null;
};

function formatWhen(ms: number | null): string {
  if (ms === null) {
    return "—";
  }
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function stateLabel(state: string, hidden: boolean): string {
  if (hidden) {
    return "Hidden";
  }
  if (state === "scheduled") {
    return "Scheduled";
  }
  if (state === "published") {
    return "Published";
  }
  return "Draft";
}

function stateDot(state: string, hidden: boolean): string {
  if (hidden || state === "draft") {
    return "bg-text/40";
  }
  if (state === "scheduled") {
    return "bg-primary";
  }
  return "bg-emerald-400";
}

const StudioReleasesPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const releases = useQuery(api.studioTracks.listMine, { filter });
  const setHidden = useMutation(api.studioTracks.setHidden);
  const update = useMutation(api.studioTracks.update);
  const cancelSchedule = useMutation(api.studioTracks.cancelSchedule);
  const publishNow = useMutation(api.studioTracks.publishNow);
  const schedule = useMutation(api.studioTracks.schedule);
  const [editingId, setEditingId] = useState<Id<"tracks"> | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget | null>(
    null
  );
  const [isScheduling, setIsScheduling] = useState(false);
  const editing = useQuery(
    api.studioTracks.getMine,
    editingId === null ? "skip" : { trackId: editingId }
  );

  const onToggleHidden = async (trackId: Id<"tracks">, hidden: boolean) => {
    try {
      await setHidden({ trackId, hidden });
      SuccessNotification({
        title: hidden ? "Hidden" : "Visible again",
        message: hidden
          ? "This release is hidden from public pages."
          : "This release is visible again where its state allows.",
      });
    } catch (error) {
      ErrorNotification({
        title: "Could not update",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    }
  };

  const onCancelSchedule = async (trackId: Id<"tracks">) => {
    try {
      await cancelSchedule({ trackId });
      SuccessNotification({
        title: "Schedule cancelled",
        message: "The release is a draft again. Publish or schedule from here.",
      });
    } catch (error) {
      ErrorNotification({
        title: "Could not cancel",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    }
  };

  const onPublishNow = async (trackId: Id<"tracks">) => {
    try {
      await publishNow({ trackId });
      SuccessNotification({
        title: "Published",
        message: "This release is live.",
      });
    } catch (error) {
      ErrorNotification({
        title: "Could not publish",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    }
  };

  const onConfirmSchedule = async (publishAtMs: number) => {
    if (scheduleTarget === null) {
      return;
    }
    setIsScheduling(true);
    try {
      await schedule({
        trackId: scheduleTarget.trackId,
        publishAt: publishAtMs,
      });
      SuccessNotification({
        title:
          scheduleTarget.mode === "change" ? "Schedule updated" : "Scheduled",
        message: "Fans will see it when the time arrives.",
      });
      setScheduleTarget(null);
    } catch (error) {
      ErrorNotification({
        title: "Could not schedule",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <ReleasesPageHeader filter={filter} onFilterChange={setFilter} />

      {releases === undefined ? (
        <ReleasesPageSkeleton />
      ) : releases.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-16 text-center">
          <Text className="text-sm text-text/55">
            No releases in this filter yet. Upload one to get started.
          </Text>
          <Button
            component={Link}
            href="/upload"
            className="mt-5 rounded-xl bg-primary text-textOnPrimary"
          >
            Upload release
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {releases.map((release) => (
            <div
              key={release.trackId}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                {release.artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={release.artworkUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-page text-xs text-text/35">
                    Art
                  </div>
                )}
                <div className="min-w-0">
                  <Text className="truncate text-sm font-medium text-text">
                    {release.title}
                  </Text>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text/45">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${stateDot(release.state, release.hidden)}`}
                      />
                      {stateLabel(release.state, release.hidden)}
                    </span>
                    <span>
                      {release.visibility === "supporters"
                        ? "Supporters only"
                        : "Public"}
                    </span>
                    <span>
                      {release.state === "scheduled"
                        ? formatWhen(release.publishAt)
                        : formatWhen(release.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <ReleaseRowActions
                trackId={release.trackId}
                state={release.state}
                hidden={release.hidden}
                onEdit={() => setEditingId(release.trackId)}
                onPublishNow={() => void onPublishNow(release.trackId)}
                onSchedule={() =>
                  setScheduleTarget({
                    trackId: release.trackId,
                    mode: "schedule",
                    publishAt: null,
                  })
                }
                onChangeSchedule={() =>
                  setScheduleTarget({
                    trackId: release.trackId,
                    mode: "change",
                    publishAt: release.publishAt,
                  })
                }
                onCancelSchedule={() => void onCancelSchedule(release.trackId)}
                onToggleHidden={() =>
                  void onToggleHidden(release.trackId, !release.hidden)
                }
              />
            </div>
          ))}
        </div>
      )}

      <ReleaseEditModal
        opened={editingId !== null}
        editing={editing}
        onClose={() => setEditingId(null)}
        onSave={async (values) => {
          if (editingId === null) {
            return;
          }
          try {
            await update({
              trackId: editingId,
              title: values.title,
              description: values.description || undefined,
              tags: values.tags,
              genre: values.genre,
              visibility: values.visibility,
              artworkFileId: values.artworkFileId,
            });
            SuccessNotification({
              title: "Saved",
              message: "Release details updated.",
            });
            setEditingId(null);
          } catch (error) {
            ErrorNotification({
              title: "Could not save",
              message:
                error instanceof Error
                  ? error.message
                  : "Try again in a moment.",
            });
          }
        }}
      />

      <ReleaseScheduleModal
        opened={scheduleTarget !== null}
        title={
          scheduleTarget?.mode === "change"
            ? "Change schedule"
            : "Schedule release"
        }
        initialPublishAt={scheduleTarget?.publishAt ?? null}
        isSubmitting={isScheduling}
        onClose={() => setScheduleTarget(null)}
        onConfirm={onConfirmSchedule}
      />
    </div>
  );
};

export default StudioReleasesPage;
