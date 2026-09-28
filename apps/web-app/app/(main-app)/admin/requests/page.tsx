"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";

import { AdminGate, AdminRequestsPage } from "@/components";
import AdminRequestsPageSkeleton from "@/components/pages/AdminRequestsPage/AdminRequestsPageSkeleton";
import { useStudioSession } from "@/hooks";
import {
  getConvexErrorMessage,
  showErrorNotification,
  showSuccessNotification,
} from "@/utils";

const AdminRequestsRoute = () => {
  const session = useStudioSession();
  const queue = useQuery(api.admin.queue, session.isAdmin ? {} : "skip");
  const approve = useMutation(api.admin.approve);
  const decline = useMutation(api.admin.decline);
  const [busyId, setBusyId] = useState<string | null>(null);

  return (
    <AdminGate>
      {queue === undefined ? (
        <AdminRequestsPageSkeleton />
      ) : (
        <AdminRequestsPage
          pending={queue.pending}
          pendingCount={queue.pendingCount}
          approvedThisMonth={queue.approvedThisMonth}
          declinedThisMonth={queue.declinedThisMonth}
          busyId={busyId}
          onApprove={(requestId) => {
            setBusyId(requestId);
            void approve({ requestId: requestId as Id<"artistRequests"> })
              .then(() => {
                showSuccessNotification(
                  "They can sign in to Artist Studio on the web.",
                  "Artist approved"
                );
              })
              .catch((error: unknown) => {
                showErrorNotification(getConvexErrorMessage(error));
              })
              .finally(() => {
                setBusyId(null);
              });
          }}
          onDecline={(requestId) => {
            setBusyId(requestId);
            void decline({ requestId: requestId as Id<"artistRequests"> })
              .then(() => {
                showSuccessNotification(
                  "They can send a new request from the phone.",
                  "Request declined"
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

export default AdminRequestsRoute;
