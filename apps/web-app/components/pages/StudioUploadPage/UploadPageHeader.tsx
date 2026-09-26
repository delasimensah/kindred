"use client";

import { Button } from "@mantine/core";
import React from "react";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

interface UploadPageHeaderProps {
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const UploadPageHeader: React.FC<UploadPageHeaderProps> = ({
  isSubmitting,
  onSaveDraft,
  onPublish,
}) => {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Heading
          variant="page"
          className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
        >
          Upload release
        </Heading>
        <Text className="mt-1.5 text-sm text-text/50">
          Add your track, tell its story, and choose when it goes live.
        </Text>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="default"
          loading={isSubmitting}
          onClick={onSaveDraft}
          className="h-auto rounded-xl border-white/10 bg-transparent px-5 py-3 text-sm font-medium text-text/70"
        >
          Save draft
        </Button>
        <Button
          loading={isSubmitting}
          onClick={onPublish}
          className="h-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95"
        >
          Publish or schedule
        </Button>
      </div>
    </div>
  );
};

export default UploadPageHeader;
