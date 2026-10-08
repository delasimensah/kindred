"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@mantine/core";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import {
  ErrorNotification,
  SuccessNotification,
} from "../../feedback/Notification/Notification";
import Text from "../../ui/Text/Text";
import AlbumEditModal from "./AlbumEditModal";
import ReleaseEditModal from "./ReleaseEditModal";
import ReleaseRow, { type ListRow } from "./ReleaseRow";
import ReleaseRowActions from "./ReleaseRowActions";
import ReleaseScheduleModal from "./ReleaseScheduleModal";
import ReleasesPageHeader, { type Filter } from "./ReleasesPageHeader";
import ReleasesPageSkeleton from "./ReleasesPageSkeleton";
import { useReleasePlayback } from "./useReleasePlayback";

type ScheduleTarget =
  | {
      kind: "single";
      trackId: Id<"tracks">;
      mode: "schedule" | "change";
      publishAt: number | null;
    }
  | {
      kind: "release";
      releaseId: Id<"releases">;
      mode: "schedule" | "change";
      publishAt: number | null;
    };

const StudioReleasesPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const playback = useReleasePlayback();
  const singles = useQuery(api.studioTracks.listMine, { filter });
  const albums = useQuery(api.studioReleases.listMine, { filter });
  const setHidden = useMutation(api.studioTracks.setHidden);
  const update = useMutation(api.studioTracks.update);
  const cancelSchedule = useMutation(api.studioTracks.cancelSchedule);
  const publishNow = useMutation(api.studioTracks.publishNow);
  const schedule = useMutation(api.studioTracks.schedule);
  const setAlbumHidden = useMutation(api.studioReleases.setHidden);
  const updateAlbum = useMutation(api.studioReleases.update);
  const cancelAlbumSchedule = useMutation(api.studioReleases.cancelSchedule);
  const publishAlbumNow = useMutation(api.studioReleases.publishNow);
  const scheduleAlbum = useMutation(api.studioReleases.schedule);
  const [editingId, setEditingId] = useState<Id<"tracks"> | null>(null);
  const [editingAlbumId, setEditingAlbumId] = useState<Id<"releases"> | null>(
    null
  );
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget | null>(
    null
  );
  const [isScheduling, setIsScheduling] = useState(false);
  const editing = useQuery(
    api.studioTracks.getMine,
    editingId === null ? "skip" : { trackId: editingId }
  );
  const editingAlbum = useQuery(
    api.studioReleases.getMine,
    editingAlbumId === null ? "skip" : { releaseId: editingAlbumId }
  );

  const rows = useMemo((): ListRow[] | undefined => {
    if (singles === undefined || albums === undefined) {
      return undefined;
    }
    const singleRows: ListRow[] = singles.map((release) => ({
      key: `single-${release.trackId}`,
      kind: "single",
      trackId: release.trackId,
      title: release.title,
      typeLabel: "Single",
      state: release.state,
      visibility: release.visibility,
      hidden: release.hidden,
      artworkUrl: release.artworkUrl,
      publishedAt: release.publishedAt,
      publishAt: release.publishAt,
      sortAt: release.publishedAt ?? release.publishAt ?? release.createdAt,
      durationMs: release.durationMs,
    }));
    const albumRows: ListRow[] = albums.map((release) => ({
      key: `release-${release.releaseId}`,
      kind: "release",
      releaseId: release.releaseId,
      title: release.title,
      typeLabel:
        release.type === "ep"
          ? `EP · ${release.trackCount} tracks`
          : `Album · ${release.trackCount} tracks`,
      state: release.state,
      visibility: release.visibility,
      hidden: release.hidden,
      artworkUrl: release.artworkUrl,
      publishedAt: release.publishedAt,
      publishAt: release.publishAt,
      sortAt: release.publishedAt ?? release.publishAt ?? release.createdAt,
      durationMs: 0,
      trackCount: release.trackCount,
    }));
    const query = search.trim().toLowerCase();
    return [...singleRows, ...albumRows]
      .filter((row) => query === "" || row.title.toLowerCase().includes(query))
      .sort((a, b) => b.sortAt - a.sortAt);
  }, [singles, albums, search]);

  const onToggleHidden = async (row: ListRow) => {
    try {
      if (row.kind === "single" && row.trackId) {
        await setHidden({ trackId: row.trackId, hidden: !row.hidden });
      } else if (row.kind === "release" && row.releaseId) {
        await setAlbumHidden({
          releaseId: row.releaseId,
          hidden: !row.hidden,
        });
      }
      SuccessNotification({
        title: !row.hidden ? "Hidden" : "Visible again",
        message: !row.hidden
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

  const onCancelSchedule = async (row: ListRow) => {
    try {
      if (row.kind === "single" && row.trackId) {
        await cancelSchedule({ trackId: row.trackId });
      } else if (row.kind === "release" && row.releaseId) {
        await cancelAlbumSchedule({ releaseId: row.releaseId });
      }
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

  const onPublishNow = async (row: ListRow) => {
    try {
      if (row.kind === "single" && row.trackId) {
        await publishNow({ trackId: row.trackId });
      } else if (row.kind === "release" && row.releaseId) {
        await publishAlbumNow({ releaseId: row.releaseId });
      }
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
      if (scheduleTarget.kind === "single") {
        await schedule({
          trackId: scheduleTarget.trackId,
          publishAt: publishAtMs,
        });
      } else {
        await scheduleAlbum({
          releaseId: scheduleTarget.releaseId,
          publishAt: publishAtMs,
        });
      }
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

  const openSchedule = (release: ListRow, mode: "schedule" | "change") => {
    const publishAt = mode === "change" ? release.publishAt : null;
    if (release.kind === "single" && release.trackId) {
      setScheduleTarget({
        kind: "single",
        trackId: release.trackId,
        mode,
        publishAt,
      });
    } else if (release.kind === "release" && release.releaseId) {
      setScheduleTarget({
        kind: "release",
        releaseId: release.releaseId,
        mode,
        publishAt,
      });
    }
  };

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <ReleasesPageHeader
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {rows === undefined ? (
        <ReleasesPageSkeleton />
      ) : rows.length === 0 && search.trim() !== "" ? (
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-16 text-center">
          <Text className="text-sm text-text/55">
            No releases match “{search.trim()}”.
          </Text>
        </div>
      ) : rows.length === 0 ? (
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
          {rows.map((release) => {
            const onEdit = () => {
              if (release.kind === "single" && release.trackId) {
                setEditingId(release.trackId);
              } else if (release.kind === "release" && release.releaseId) {
                setEditingAlbumId(release.releaseId);
              }
            };
            return (
              <ReleaseRow
                key={release.key}
                release={release}
                active={playback.activeKey === release.key}
                playing={playback.playing}
                onPlay={() => void playback.play(release, rows)}
                onEdit={onEdit}
                actions={
                  <ReleaseRowActions
                    state={release.state}
                    hidden={release.hidden}
                    onEdit={onEdit}
                    onPublishNow={() => void onPublishNow(release)}
                    onSchedule={() => openSchedule(release, "schedule")}
                    onChangeSchedule={() => openSchedule(release, "change")}
                    onCancelSchedule={() => void onCancelSchedule(release)}
                    onToggleHidden={() => void onToggleHidden(release)}
                  />
                }
              />
            );
          })}
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

      <AlbumEditModal
        opened={editingAlbumId !== null}
        editing={
          editingAlbum === undefined || editingAlbum === null
            ? editingAlbum
            : {
                releaseId: editingAlbum.releaseId,
                title: editingAlbum.title,
                type: editingAlbum.type,
                description: editingAlbum.description,
                tags: editingAlbum.tags,
                genre: editingAlbum.genre,
                visibility: editingAlbum.visibility,
                state: editingAlbum.state,
                artworkUrl: editingAlbum.artworkUrl,
                tracks: editingAlbum.tracks,
              }
        }
        onClose={() => setEditingAlbumId(null)}
        onSave={async (values) => {
          if (editingAlbumId === null) {
            return;
          }
          try {
            await updateAlbum({
              releaseId: editingAlbumId,
              title: values.title,
              description: values.description || undefined,
              tags: values.tags,
              genre: values.genre,
              visibility: values.visibility,
              artworkFileId: values.artworkFileId,
              tracks: values.tracks,
            });
            SuccessNotification({
              title: "Saved",
              message: "Release details and track titles updated.",
            });
            setEditingAlbumId(null);
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
