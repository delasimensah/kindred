"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";

import { AdminArtistsPage, AdminGate } from "@/components";
import AdminArtistsPageSkeleton from "@/components/pages/AdminArtistsPage/AdminArtistsPageSkeleton";
import { useStudioSession } from "@/hooks";
import {
  getConvexErrorMessage,
  showErrorNotification,
  showSuccessNotification,
} from "@/utils";

const AdminArtistsRoute = () => {
  const session = useStudioSession();
  const artists = useQuery(
    api.admin.listArtists,
    session.isAdmin ? {} : "skip"
  );
  const setVerified = useMutation(api.admin.setVerified);
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <AdminGate>
      {artists === undefined ? (
        <AdminArtistsPageSkeleton />
      ) : (
        <AdminArtistsPage
          artists={artists}
          busyId={busyId}
          onSetVerified={(artistId, verified) => {
            setBusyId(artistId);
            void setVerified({
              artistId: artistId as Id<"artists">,
              verified,
            })
              .then(() => {
                showSuccessNotification(
                  verified
                    ? "They can sign in to Artist Studio."
                    : "They can no longer open Artist Studio.",
                  verified ? "Artist verified" : "Artist unverified"
                );
              })
              .catch((error: unknown) => {
                showErrorNotification(getConvexErrorMessage(error));
              })
              .finally(() => {
                setBusyId(null);
              });
          }}
        />
      )}
    </AdminGate>
  );
};

export default AdminArtistsRoute;
