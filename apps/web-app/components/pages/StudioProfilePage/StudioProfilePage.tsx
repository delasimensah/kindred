"use client";

import { api } from "@convex/_generated/api";
import { Button, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconEye } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";

import { uploadStudioImage } from "@/utils";

import {
  ErrorNotification,
  SuccessNotification,
} from "../../feedback/Notification/Notification";
import ImageCropModal, {
  type ImageCropKind,
} from "../../media/ImageCropModal/ImageCropModal";
import Heading from "../../ui/Heading/Heading";
import Skeleton from "../../ui/Skeleton/Skeleton";
import Text from "../../ui/Text/Text";
import ProfileAvatarField from "./ProfileAvatarField";
import ProfileCoverField from "./ProfileCoverField";
import ProfileStatusCard from "./ProfileStatusCard";

const BIO_MAX = 300;

type CropDraft = {
  kind: ImageCropKind;
  imageSrc: string;
  fileName: string;
};

const StudioProfilePage: React.FC = () => {
  const profile = useQuery(api.studio.getMyProfile, {});
  const updateMyProfile = useMutation(api.studio.updateMyProfile);
  const generateImageUploadUrl = useMutation(api.studio.generateImageUploadUrl);
  const saveAvatar = useMutation(api.studio.saveAvatar);
  const saveCover = useMutation(api.studio.saveCover);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<"avatar" | "cover" | null>(
    null
  );
  const [cropDraft, setCropDraft] = useState<CropDraft | null>(null);
  const form = useForm({ initialValues: { name: "", bio: "" } });

  useEffect(() => {
    if (profile) {
      form.setValues({ name: profile.name, bio: profile.bio });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.artistId, profile?.name, profile?.bio]);

  useEffect(() => {
    return () => {
      if (cropDraft?.imageSrc) {
        URL.revokeObjectURL(cropDraft.imageSrc);
      }
    };
  }, [cropDraft?.imageSrc]);

  if (profile === undefined) {
    return (
      <div className="px-4 py-8 sm:px-8 lg:px-10">
        <Skeleton className="mb-8 h-10 w-56" />
        <Skeleton className="mb-6 h-44 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
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
          Profile editing is for verified artists. Sign in with a seeded artist
          account to edit name, bio, avatar, and cover.
        </Text>
      </div>
    );
  }

  const closeCrop = () => {
    if (cropDraft?.imageSrc) {
      URL.revokeObjectURL(cropDraft.imageSrc);
    }
    setCropDraft(null);
  };

  const openCrop = (file: File, kind: ImageCropKind) => {
    if (cropDraft?.imageSrc) {
      URL.revokeObjectURL(cropDraft.imageSrc);
    }
    setCropDraft({
      kind,
      imageSrc: URL.createObjectURL(file),
      fileName: file.name,
    });
  };

  const onSave = async (values: { name: string; bio: string }) => {
    setIsSaving(true);
    try {
      await updateMyProfile({ name: values.name, bio: values.bio });
      SuccessNotification({
        title: "Saved",
        message: "Your artist profile was updated.",
      });
    } catch (error) {
      ErrorNotification({
        title: "Could not save",
        message:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onCroppedImage = async (file: File, kind: ImageCropKind) => {
    closeCrop();
    setIsUploading(kind);
    try {
      await uploadStudioImage({
        file,
        generateUrl: () => generateImageUploadUrl({}),
        save: kind === "avatar" ? saveAvatar : saveCover,
      });
      SuccessNotification({
        title: kind === "avatar" ? "Avatar updated" : "Cover updated",
        message: "Your image is live on the artist profile.",
      });
    } catch (error) {
      ErrorNotification({
        title: "Upload failed",
        message:
          error instanceof Error ? error.message : "Try another image file.",
      });
    } finally {
      setIsUploading(null);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-9 lg:px-10">
      {cropDraft ? (
        <ImageCropModal
          key={cropDraft.imageSrc}
          opened
          imageSrc={cropDraft.imageSrc}
          fileName={cropDraft.fileName}
          kind={cropDraft.kind}
          onCancel={closeCrop}
          onConfirm={(file) => {
            void onCroppedImage(file, cropDraft.kind);
          }}
        />
      ) : null}

      <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            Artist profile
          </Heading>
          <Text className="mt-1.5 text-sm text-text/50">
            This is what supporters see on your public page.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="default"
            disabled
            leftSection={<IconEye size={16} />}
            className="h-auto rounded-xl border-white/10 bg-transparent px-5 py-3 text-sm font-medium text-text/50"
          >
            Preview page
          </Button>
          <Button
            loading={isSaving}
            onClick={() => void form.onSubmit(onSave)()}
            className="h-auto rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95"
          >
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ProfileCoverField
            coverUrl={profile.coverUrl}
            isUploading={isUploading === "cover"}
            onPickFile={(file) => openCrop(file, "cover")}
          />

          <form
            className="space-y-6 rounded-2xl border border-white/5 bg-surface p-7"
            onSubmit={form.onSubmit(onSave)}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text/80">
              Basic info
            </h2>
            <TextInput
              label="Display name"
              classNames={{
                label: "mb-2 text-sm text-text/70",
                input:
                  "rounded-xl border-white/10 bg-page px-4 py-3 text-sm text-text",
              }}
              {...form.getInputProps("name")}
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Text
                  className="text-sm text-text/70"
                  component="label"
                  htmlFor="bio"
                >
                  Bio
                </Text>
                <Text className="text-xs text-text/35">
                  {form.values.bio.length} / {BIO_MAX}
                </Text>
              </div>
              <Textarea
                id="bio"
                rows={5}
                maxLength={BIO_MAX}
                classNames={{
                  input:
                    "rounded-xl border-white/10 bg-page px-4 py-3 text-sm text-text",
                }}
                {...form.getInputProps("bio")}
              />
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <ProfileAvatarField
            avatarUrl={profile.avatarUrl}
            displayName={profile.name}
            isUploading={isUploading === "avatar"}
            onPickFile={(file) => openCrop(file, "avatar")}
          />
          <ProfileStatusCard handle={profile.handle} hidden={profile.hidden} />
        </div>
      </div>
    </div>
  );
};

export default StudioProfilePage;
