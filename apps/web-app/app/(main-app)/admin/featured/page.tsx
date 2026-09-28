"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";

import { AdminFeaturedPage, AdminGate } from "@/components";
import type { FeaturedSlotRow } from "@/components/pages/AdminFeaturedPage/AdminFeaturedPage";
import AdminFeaturedPageSkeleton from "@/components/pages/AdminFeaturedPage/AdminFeaturedPageSkeleton";
import { useStudioSession } from "@/hooks";
import {
  getConvexErrorMessage,
  showErrorNotification,
  showSuccessNotification,
} from "@/utils";

const AdminFeaturedRoute = () => {
  const session = useStudioSession();
  const featured = useQuery(
    api.admin.listFeatured,
    session.isAdmin ? {} : "skip"
  );
  const setFeaturedSlots = useMutation(api.admin.setFeaturedSlots);
  const [override, setOverride] = useState<FeaturedSlotRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const savedSlots =
    featured === undefined
      ? null
      : featured.slots.map((slot) => ({
          artistId: slot.artistId,
          name: slot.name,
          handle: slot.handle,
          bio: slot.bio,
          avatarUrl: slot.avatarUrl,
          live: slot.live,
        }));
  const savedKey = savedSlots?.map((slot) => slot.artistId).join("|") ?? "";
  const overrideKey = override?.map((slot) => slot.artistId).join("|") ?? "";
  if (override !== null && savedSlots !== null && savedKey === overrideKey) {
    setOverride(null);
  }
  const draft = override ?? savedSlots;

  return (
    <AdminGate>
      {featured === undefined || draft === null ? (
        <AdminFeaturedPageSkeleton />
      ) : (
        <AdminFeaturedPage
          slots={draft}
          artists={featured.artists}
          dirty={override !== null}
          saving={saving}
          onMove={(index, direction) => {
            const next = index + direction;
            if (next < 0 || next >= draft.length) {
              return;
            }
            const copy = [...draft];
            const [moved] = copy.splice(index, 1);
            if (moved === undefined) {
              return;
            }
            copy.splice(next, 0, moved);
            setOverride(copy);
          }}
          onRemove={(artistId) => {
            setOverride(draft.filter((slot) => slot.artistId !== artistId));
          }}
          onAdd={(artistId) => {
            const artist = featured.artists.find(
              (row) => row.artistId === artistId
            );
            if (artist === undefined || draft.length >= 6) {
              return;
            }
            setOverride([
              ...draft,
              {
                artistId: artist.artistId,
                name: artist.name,
                handle: artist.handle,
                bio: artist.bio,
                avatarUrl: artist.avatarUrl,
                live: true,
              },
            ]);
          }}
          onSave={() => {
            setSaving(true);
            void setFeaturedSlots({
              artistIds: draft.map((slot) => slot.artistId as Id<"artists">),
            })
              .then(() => {
                showSuccessNotification(
                  "Discover will show this order.",
                  "Featured slots saved"
                );
              })
              .catch((error: unknown) => {
                showErrorNotification(getConvexErrorMessage(error));
              })
              .finally(() => {
                setSaving(false);
              });
          }}
        />
      )}
    </AdminGate>
  );
};

export default AdminFeaturedRoute;
