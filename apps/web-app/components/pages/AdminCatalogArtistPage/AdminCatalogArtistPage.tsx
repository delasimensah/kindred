"use client";

import { Button } from "@mantine/core";
import React, { useState } from "react";

import ConfirmDeleteModal from "../../feedback/ConfirmDeleteModal/ConfirmDeleteModal";
import Breadcrumb from "../../navigation/Breadcrumb/Breadcrumb";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";
import type { CatalogTrackRowData } from "../AdminCatalogPage/CatalogTrackRow";
import { ReleaseBlock, Section, TrackBlock } from "./CatalogArtistBlocks";

export interface CatalogReleaseRow {
  releaseId: string;
  title: string;
  type: "ep" | "album";
  visibility: "public" | "supporters";
  state: "scheduled" | "published";
  hidden: boolean;
  tracks: CatalogTrackRowData[];
}

interface CatalogArtist {
  artistId: string;
  name: string;
  handle: string;
  hidden: boolean;
}

interface AdminCatalogArtistPageProps {
  artist: CatalogArtist;
  scheduledReleases: CatalogReleaseRow[];
  scheduledSingles: CatalogTrackRowData[];
  scheduledHasMore: boolean;
  releases: CatalogReleaseRow[];
  singles: CatalogTrackRowData[];
  canLoadReleases: boolean;
  canLoadSingles: boolean;
  busyId: string | null;
  onOpenScheduled: () => void;
  onLoadReleases: () => void;
  onLoadSingles: () => void;
  onSetArtistHidden: (hidden: boolean) => void;
  onSetReleaseHidden: (releaseId: string, hidden: boolean) => void;
  onSetTrackHidden: (trackId: string, hidden: boolean) => void;
  onRemoveTrack: (trackId: string) => void;
}

const AdminCatalogArtistPage: React.FC<AdminCatalogArtistPageProps> = ({
  artist,
  scheduledReleases,
  scheduledSingles,
  scheduledHasMore,
  releases,
  singles,
  canLoadReleases,
  canLoadSingles,
  busyId,
  onOpenScheduled,
  onLoadReleases,
  onLoadSingles,
  onSetArtistHidden,
  onSetReleaseHidden,
  onSetTrackHidden,
  onRemoveTrack,
}) => {
  const [pendingRemove, setPendingRemove] =
    useState<CatalogTrackRowData | null>(null);
  const nothing =
    scheduledReleases.length === 0 &&
    scheduledSingles.length === 0 &&
    releases.length === 0 &&
    singles.length === 0 &&
    !canLoadReleases &&
    !canLoadSingles;

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <Breadcrumb
        items={[
          { label: "Catalog", href: "/admin/catalog" },
          { label: artist.name },
        ]}
      />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            {artist.name}
          </Heading>
          <Text className="mt-1.5 text-sm text-text/50">@{artist.handle}</Text>
        </div>
        <Button
          disabled={busyId !== null}
          loading={busyId === artist.artistId}
          onClick={() => onSetArtistHidden(!artist.hidden)}
          className={
            artist.hidden
              ? "h-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-textOnPrimary hover:brightness-95"
              : "h-auto rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-semibold text-text/70 hover:bg-white/5"
          }
        >
          {artist.hidden ? "Unhide artist" : "Hide artist"}
        </Button>
      </div>

      {nothing ? (
        <div className="rounded-2xl border border-white/5 bg-surface px-6 py-12 text-center">
          <Text className="text-sm text-text/50">Nothing published yet.</Text>
          <button
            type="button"
            onClick={onOpenScheduled}
            className="mt-4 text-sm font-semibold text-primary"
          >
            Scheduled
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {scheduledReleases.length > 0 || scheduledSingles.length > 0 ? (
            <Section title="Scheduled">
              {scheduledReleases.map((release) => (
                <ReleaseBlock
                  key={release.releaseId}
                  release={release}
                  busyId={busyId}
                  onSetReleaseHidden={onSetReleaseHidden}
                  onSetTrackHidden={onSetTrackHidden}
                  onAskRemove={setPendingRemove}
                />
              ))}
              <TrackBlock
                tracks={scheduledSingles}
                busyId={busyId}
                onSetTrackHidden={onSetTrackHidden}
                onAskRemove={setPendingRemove}
              />
              {scheduledHasMore ? (
                <button
                  type="button"
                  onClick={onOpenScheduled}
                  className="text-sm font-semibold text-primary"
                >
                  More in Scheduled
                </button>
              ) : null}
            </Section>
          ) : null}

          <Section
            title="Albums and EPs"
            hint="Each one is a group. The tracks listed under it belong to that album or EP."
          >
            {releases.length === 0 ? (
              <Text className="text-sm text-text/50">No albums or EPs.</Text>
            ) : (
              releases.map((release) => (
                <ReleaseBlock
                  key={release.releaseId}
                  release={release}
                  busyId={busyId}
                  onSetReleaseHidden={onSetReleaseHidden}
                  onSetTrackHidden={onSetTrackHidden}
                  onAskRemove={setPendingRemove}
                />
              ))
            )}
            {canLoadReleases ? (
              <button
                type="button"
                onClick={onLoadReleases}
                className="text-sm font-semibold text-primary"
              >
                Load more albums and EPs
              </button>
            ) : null}
          </Section>

          <Section
            title="Singles"
            hint="Tracks that stand on their own, not inside an album or EP."
          >
            {singles.length === 0 && !canLoadSingles ? (
              <Text className="text-sm text-text/50">No singles.</Text>
            ) : (
              <TrackBlock
                tracks={singles}
                busyId={busyId}
                onSetTrackHidden={onSetTrackHidden}
                onAskRemove={setPendingRemove}
              />
            )}
            {canLoadSingles ? (
              <button
                type="button"
                onClick={onLoadSingles}
                className="text-sm font-semibold text-primary"
              >
                Load more singles
              </button>
            ) : null}
          </Section>
        </div>
      )}

      <ConfirmDeleteModal
        opened={pendingRemove !== null}
        title="Remove this track?"
        message={
          pendingRemove === null
            ? ""
            : `${pendingRemove.title} leaves the catalog. Fans will not see it again.`
        }
        confirmLabel="Remove"
        isConfirming={
          pendingRemove !== null && busyId === pendingRemove.trackId
        }
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          if (pendingRemove === null) {
            return;
          }
          onRemoveTrack(pendingRemove.trackId);
          setPendingRemove(null);
        }}
      />
    </div>
  );
};

export default AdminCatalogArtistPage;
