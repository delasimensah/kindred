"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Textarea } from "@mantine/core";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

import Heading from "../../ui/Heading/Heading";
import StudioChoiceCards from "../../ui/StudioChoiceCards/StudioChoiceCards";
import Text from "../../ui/Text/Text";
import { studioFieldClassNames } from "../studioFieldStyles";
import ComposerAttachments from "./ComposerAttachments";
import ComposerPageHeader from "./ComposerPageHeader";
import ComposerPreview from "./ComposerPreview";
import { useUpdateComposer } from "./useUpdateComposer";

const StudioUpdateComposerPage: React.FC = () => {
  const profile = useQuery(api.studio.getMyProfile, {});
  const searchParams = useSearchParams();
  const editPostId = useMemo((): Id<"updatePosts"> | null => {
    const raw = searchParams.get("postId");
    if (raw === null || raw.length === 0) {
      return null;
    }
    return raw as Id<"updatePosts">;
  }, [searchParams]);
  const composer = useUpdateComposer(editPostId);

  if (profile === undefined || composer.existingStatus === "loading") {
    return (
      <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
        <Text className="text-sm text-text/50">Loading composer…</Text>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Heading variant="section" className="mb-3 text-xl text-text">
          No artist profile linked
        </Heading>
        <Text className="max-w-md text-sm text-text/60">
          Only a verified artist can post updates.
        </Text>
      </div>
    );
  }

  if (composer.existingStatus === "missing") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Heading variant="section" className="mb-3 text-xl text-text">
          Update not found
        </Heading>
        <Text className="max-w-md text-sm text-text/60">
          That update is gone, or it belongs to another artist.
        </Text>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      <ComposerPageHeader
        isEditing={composer.isEditing}
        isSubmitting={composer.isSubmitting}
        canPost={composer.canPost}
        onPost={() => {
          void composer.onPost();
        }}
      />

      <div className="grid max-w-[980px] grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-white/5 bg-surface p-5 sm:p-7">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text/80">
              Audience
            </h2>
            <StudioChoiceCards
              name="audience"
              value={composer.audience}
              onChange={composer.setAudience}
              options={[
                {
                  value: "everyone",
                  label: "Everyone",
                  description: "Visible to all visitors on your page",
                },
                {
                  value: "supporters",
                  label: "Supporters only",
                  description: "Only visible to paying supporters",
                },
              ]}
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface p-5 sm:p-7">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="update-body"
                className="block text-sm text-text/70"
              >
                What&apos;s on your mind?
              </label>
              <span className="text-xs text-text/35">
                {composer.body.length} / {composer.BODY_MAX}
              </span>
            </div>
            <Textarea
              id="update-body"
              value={composer.body}
              maxLength={composer.BODY_MAX}
              minRows={6}
              placeholder="Tell your supporters what's new — studio updates, tour news, behind-the-scenes moments…"
              onChange={(event) => composer.setBody(event.currentTarget.value)}
              classNames={{
                input: studioFieldClassNames.input,
              }}
              className="w-full"
            />
          </div>

          <ComposerAttachments
            photoName={composer.photo?.file.name ?? null}
            photoPreviewUrl={composer.photoPreviewUrl}
            onPickPhoto={composer.onPickPhoto}
            onClearPhoto={composer.clearPhoto}
            voiceSupported={composer.voiceSupport.ok}
            voiceUnsupportedReason={
              composer.voiceSupport.ok ? null : composer.voiceSupport.reason
            }
            isRecording={composer.isRecording}
            recordingMs={composer.recordingMs}
            voiceLabel={composer.voiceLabel}
            onToggleRecord={() => {
              void composer.onToggleRecord();
            }}
            onClearVoice={composer.clearVoice}
          />
        </div>

        <div className="lg:col-span-1">
          <ComposerPreview
            artistName={profile.name}
            avatarUrl={profile.avatarUrl}
            body={composer.body}
            audience={composer.audience}
            photoPreviewUrl={composer.photoPreviewUrl}
            voiceLabel={composer.voiceLabel}
          />
        </div>
      </div>
    </div>
  );
};

export default StudioUpdateComposerPage;
