"use client";

import { api } from "@convex/_generated/api";
import { useDebouncedValue } from "@mantine/hooks";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { AdminCatalogPage, AdminGate } from "@/components";
import type { CatalogBrowse } from "@/components/pages/AdminCatalogPage/AdminCatalogPage";
import AdminCatalogPageSkeleton from "@/components/pages/AdminCatalogPage/AdminCatalogPageSkeleton";
import { useStudioSession } from "@/hooks";

import { useCatalogModeration } from "./useCatalogModeration";

const PAGE = 24;

const AdminCatalogRoute = () => {
  const session = useStudioSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queue = searchParams.get("queue");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [browse, setBrowse] = useState<CatalogBrowse>(
    queue === "hidden" || queue === "scheduled" ? queue : "artists"
  );
  const moderation = useCatalogModeration();
  const draft = search.trim();
  const term = debouncedSearch.trim();
  const searching = draft.length > 0;
  const enabled = session.isAdmin;

  const artists = usePaginatedQuery(
    api.adminCatalog.listArtists,
    enabled && browse === "artists" ? {} : "skip",
    { initialNumItems: PAGE }
  );
  const hidden = usePaginatedQuery(
    api.adminCatalog.listHiddenTracks,
    enabled && browse === "hidden" ? {} : "skip",
    { initialNumItems: PAGE }
  );
  const scheduled = usePaginatedQuery(
    api.adminCatalog.listScheduledTracks,
    enabled && browse === "scheduled" ? {} : "skip",
    { initialNumItems: PAGE }
  );
  const artistMatches = useQuery(
    api.adminCatalog.searchArtists,
    enabled && term.length > 0 ? { term } : "skip"
  );
  const trackSearch = usePaginatedQuery(
    api.adminCatalog.searchTracks,
    enabled && term.length > 0 ? { term } : "skip",
    { initialNumItems: PAGE }
  );

  const list =
    browse === "hidden" ? hidden : browse === "scheduled" ? scheduled : artists;
  const queryReady =
    term.length > 0 &&
    trackSearch.status !== "LoadingFirstPage" &&
    artistMatches !== undefined;
  const resultsPending = searching && !queryReady;

  if (!searching && list.status === "LoadingFirstPage") {
    return (
      <AdminGate>
        <AdminCatalogPageSkeleton />
      </AdminGate>
    );
  }

  const shownArtists = queryReady ? (artistMatches ?? []) : [];
  const shownTracks = queryReady ? trackSearch.results : [];

  return (
    <AdminGate>
      <AdminCatalogPage
        search={search}
        browse={browse}
        searching={searching}
        resultsPending={resultsPending}
        artists={browse === "artists" ? artists.results : []}
        artistMatches={shownArtists}
        tracks={
          searching
            ? shownTracks
            : browse === "hidden"
              ? hidden.results
              : browse === "scheduled"
                ? scheduled.results
                : []
        }
        canLoadMore={
          searching
            ? queryReady &&
              term === draft &&
              trackSearch.status === "CanLoadMore"
            : list.status === "CanLoadMore"
        }
        busyId={moderation.busyId}
        onSearchChange={setSearch}
        onBrowseChange={(next) => {
          setSearch("");
          setBrowse(next);
        }}
        onLoadMore={() => {
          if (searching) {
            if (term === draft) {
              trackSearch.loadMore(PAGE);
            }
            return;
          }
          list.loadMore(PAGE);
        }}
        onOpenArtist={(artistId) => {
          router.push(`/admin/catalog/${artistId}`);
        }}
        onSetArtistHidden={moderation.hideArtist}
        onSetTrackHidden={moderation.hideTrack}
        onRemoveTrack={moderation.removeTrack}
      />
    </AdminGate>
  );
};

export default AdminCatalogRoute;
