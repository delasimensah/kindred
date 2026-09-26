"use client";

import { Button } from "@mantine/core";
import Link from "next/link";
import React from "react";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

interface ComposerPageHeaderProps {
  isEditing: boolean;
  isSubmitting: boolean;
  canPost: boolean;
  onPost: () => void;
}

const ComposerPageHeader: React.FC<ComposerPageHeaderProps> = ({
  isEditing,
  isSubmitting,
  canPost,
  onPost,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
      <div className="min-w-0">
        <Text className="mb-1 text-xs text-text/40">
          <Link href="/updates" className="hover:text-primary">
            Updates
          </Link>{" "}
          / {isEditing ? "Edit" : "Compose"}
        </Text>
        <Heading
          variant="page"
          className="mb-0 font-display text-2xl font-medium leading-tight text-text sm:text-[28px]"
        >
          {isEditing ? "Edit update" : "Compose update"}
        </Heading>
        <Text className="mt-1.5 text-sm text-text/50">
          {isEditing
            ? "Change the text, audience, photo, or voice note."
            : "Share a note, a photo, or a voice message with your supporters."}
        </Text>
      </div>
      <Button
        loading={isSubmitting}
        disabled={!canPost}
        onClick={onPost}
        className="h-auto w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95 disabled:opacity-50 sm:w-auto"
      >
        {isEditing ? "Save changes" : "Post update"}
      </Button>
    </div>
  );
};

export default ComposerPageHeader;
