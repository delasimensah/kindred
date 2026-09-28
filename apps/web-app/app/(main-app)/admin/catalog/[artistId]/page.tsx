"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import { AdminGate, Breadcrumb } from "@/components";
import AdminCatalogArtistPage from "@/components/pages/AdminCatalogArtistPage/AdminCatalogArtistPage";
import AdminCatalogArtistPageSkeleton from "@/components/pages/AdminCatalogArtistPage/AdminCatalogArtistPageSkeleton";
import { useStudioSession } from "@/hooks";

import { useCatalogModeration } from "../useCatalogModeration";

const PAGE = 12;

const AdminCatalogArtistRoute = () => {
  const session = useStudioSession();
  const router = useRouter();
  const params = useParams<{ artistId: string }>();
  const artistId = params.artistId as Id<"artists">;
  const moderation = useCatalogModeration();
  const enabled = session.isAdmin;
  const artist = useQuery(
    api.adminCatalog.getArtist,
    enabled ? { artistId } : "skip"
  );
  const scheduled = useQuery(
    api.adminCatalog.listScheduledForArtist,
    enabled ? { artistId } : "skip"
  );
  const releases = usePaginatedQuery(
    api.adminCatalog.listReleases,
    enabled ? { artistId } : "skip",
    { initialNumItems: PAGE }
  );
  const singles = usePaginatedQuery(
    api.adminCatalog.listSingles,
    enabled ? { artistId } : "skip",
    { initialNumItems: PAGE }
  );

  const loading =
    artist === undefined ||
    scheduled === undefined ||
    releases.status === "LoadingFirstPage" ||
    singles.status === "LoadingFirstPage";

  return (
    <AdminGate>
      {loading ? (
        <AdminCatalogArtistPageSkeleton />
      ) : artist === null ? (
        <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
          <Breadcrumb
            items={[
              { label: "Catalog", href: "/admin/catalog" },
              { label: "Not found" },
            ]}
          />
          <p className="text-sm text-text/50">
            That artist is not in the catalog.
          </p>
        </div>
      ) : (
        <AdminCatalogArtistPage
          artist={artist}
          scheduledReleases={scheduled.releases}
          scheduledSingles={scheduled.singles}
          scheduledHasMore={scheduled.hasMore}
          releases={releases.results}
          singles={singles.results}
          canLoadReleases={releases.status === "CanLoadMore"}
          canLoadSingles={singles.status === "CanLoadMore"}
          busyId={moderation.busyId}
          onOpenScheduled={() => router.push("/admin/catalog?queue=scheduled")}
          onLoadReleases={() => releases.loadMore(PAGE)}
          onLoadSingles={() => singles.loadMore(PAGE)}
          onSetArtistHidden={(hidden) =>
            moderation.hideArtist(artist.artistId, hidden)
          }
          onSetReleaseHidden={moderation.hideRelease}
          onSetTrackHidden={moderation.hideTrack}
          onRemoveTrack={moderation.removeTrack}
        />
      )}
    </AdminGate>
  );
};

export default AdminCatalogArtistRoute;
