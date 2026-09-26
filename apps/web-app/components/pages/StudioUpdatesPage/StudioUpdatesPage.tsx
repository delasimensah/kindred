"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";

import {
  getConvexErrorMessage,
  showErrorNotification,
  showSuccessNotification,
} from "@/utils";

import ConfirmDeleteModal from "../../feedback/ConfirmDeleteModal/ConfirmDeleteModal";
import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";
import UpdateListItem from "./UpdateListItem";
import UpdatesPageHeader from "./UpdatesPageHeader";
import UpdatesPageSkeleton from "./UpdatesPageSkeleton";

const StudioUpdatesPage: React.FC = () => {
  const profile = useQuery(api.studio.getMyProfile, {});
  const posts = useQuery(api.posts.listMine, {});
  const removePost = useMutation(api.posts.remove);
  const [pendingDeleteId, setPendingDeleteId] =
    useState<Id<"updatePosts"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (profile === undefined || posts === undefined) {
    return <UpdatesPageSkeleton />;
  }

  if (profile === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Heading variant="section" className="mb-3 text-xl text-text">
          No artist profile linked
        </Heading>
        <Text className="max-w-md text-sm text-text/60">
          Updates are for a verified artist. Sign in with a seeded artist
          account, or finish artist approval first.
        </Text>
      </div>
    );
  }

  const onConfirmDelete = async () => {
    if (pendingDeleteId === null) {
      return;
    }
    setIsDeleting(true);
    try {
      await removePost({ postId: pendingDeleteId });
      showSuccessNotification("Update deleted.");
      setPendingDeleteId(null);
    } catch (error) {
      showErrorNotification(
        getConvexErrorMessage(error, "Could not delete update.")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <UpdatesPageHeader />

      {posts.length === 0 ? (
        <div className="max-w-[820px] rounded-2xl border border-dashed border-white/15 bg-surface/50 px-6 py-16 text-center">
          <Heading variant="section" className="mb-2 text-lg text-text">
            No updates yet
          </Heading>
          <Text className="text-sm text-text/50">
            Compose your first note for fans or supporters.
          </Text>
        </div>
      ) : (
        <div className="max-w-[820px] space-y-4">
          {posts.map((post) => (
            <UpdateListItem
              key={post.postId}
              post={post}
              artistName={profile.name}
              avatarUrl={profile.avatarUrl}
              isDeleting={isDeleting && pendingDeleteId === post.postId}
              onDelete={() => setPendingDeleteId(post.postId)}
            />
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        opened={pendingDeleteId !== null}
        title="Delete update?"
        message="Fans will no longer see this update. This cannot be undone."
        confirmLabel="Delete update"
        isConfirming={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setPendingDeleteId(null);
          }
        }}
        onConfirm={() => {
          void onConfirmDelete();
        }}
      />
    </div>
  );
};

export default StudioUpdatesPage;
