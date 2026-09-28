"use client";

import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import React, { useState } from "react";

import ConfirmDeleteModal from "../../feedback/ConfirmDeleteModal/ConfirmDeleteModal";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";
import {
  ArtistList,
  FilterChip,
  ResultsSkeleton,
  SearchResults,
  TrackList,
} from "./CatalogSections";
import type { CatalogTrackRowData } from "./CatalogTrackRow";

export interface CatalogArtistRow {
  artistId: string;
  name: string;
  handle: string;
  hidden: boolean;
  avatarUrl: string | null;
}

export type CatalogBrowse = "artists" | "hidden" | "scheduled";

interface AdminCatalogPageProps {
  search: string;
  browse: CatalogBrowse;
  searching: boolean;
  artists: CatalogArtistRow[];
  artistMatches: CatalogArtistRow[];
  tracks: CatalogTrackRowData[];
  resultsPending: boolean;
  canLoadMore: boolean;
  busyId: string | null;
  onSearchChange: (value: string) => void;
  onBrowseChange: (browse: CatalogBrowse) => void;
  onLoadMore: () => void;
  onOpenArtist: (artistId: string) => void;
  onSetArtistHidden: (artistId: string, hidden: boolean) => void;
  onSetTrackHidden: (trackId: string, hidden: boolean) => void;
  onRemoveTrack: (trackId: string) => void;
}

const AdminCatalogPage: React.FC<AdminCatalogPageProps> = ({
  search,
  browse,
  searching,
  artists,
  artistMatches,
  tracks,
  resultsPending,
  canLoadMore,
  busyId,
  onSearchChange,
  onBrowseChange,
  onLoadMore,
  onOpenArtist,
  onSetArtistHidden,
  onSetTrackHidden,
  onRemoveTrack,
}) => {
  const [pendingRemove, setPendingRemove] =
    useState<CatalogTrackRowData | null>(null);

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            Catalog
          </Heading>
          <Text className="mt-1.5 max-w-xl text-sm text-text/50">
            Start with an artist, search for a track, or open Hidden and
            Scheduled.
          </Text>
        </div>
        <TextInput
          aria-label="Search tracks or artists"
          placeholder="Search tracks or artists"
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          className="w-full lg:w-72"
          classNames={{
            input:
              "border-white/10 bg-surface text-text placeholder:text-text/35",
          }}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip
          label="Artists"
          selected={!searching && browse === "artists"}
          onClick={() => onBrowseChange("artists")}
        />
        <FilterChip
          label="Hidden"
          selected={!searching && browse === "hidden"}
          onClick={() => onBrowseChange("hidden")}
        />
        <FilterChip
          label="Scheduled"
          selected={!searching && browse === "scheduled"}
          onClick={() => onBrowseChange("scheduled")}
        />
      </div>

      {resultsPending ? <ResultsSkeleton /> : null}

      {!resultsPending && searching ? (
        <SearchResults
          artistMatches={artistMatches}
          tracks={tracks}
          busyId={busyId}
          onOpenArtist={onOpenArtist}
          onSetArtistHidden={onSetArtistHidden}
          onSetTrackHidden={onSetTrackHidden}
          onAskRemove={setPendingRemove}
          onBrowseChange={onBrowseChange}
        />
      ) : null}

      {!resultsPending && !searching && browse === "artists" ? (
        <ArtistList
          artists={artists}
          busyId={busyId}
          onOpenArtist={onOpenArtist}
          onSetArtistHidden={onSetArtistHidden}
        />
      ) : null}

      {!resultsPending && !searching && browse !== "artists" ? (
        <TrackList
          tracks={tracks}
          busyId={busyId}
          empty={
            browse === "hidden" ? "Nothing is hidden." : "Nothing is scheduled."
          }
          emptyAction="Artists"
          onEmptyAction={() => onBrowseChange("artists")}
          onSetTrackHidden={onSetTrackHidden}
          onAskRemove={setPendingRemove}
        />
      ) : null}

      {canLoadMore ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onLoadMore}
            className="text-sm font-semibold text-primary"
          >
            Load more
          </button>
        </div>
      ) : null}

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

export default AdminCatalogPage;
