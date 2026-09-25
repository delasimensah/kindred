"use client";

import { api } from "@convex/_generated/api";
import { Button, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCamera, IconEye } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from "react";

import { uploadStudioImage } from "@/utils";

import {
  ErrorNotification,
  SuccessNotification,
} from "../../feedback/Notification/Notification";
import Heading from "../../ui/Heading/Heading";
import Skeleton from "../../ui/Skeleton/Skeleton";
import Text from "../../ui/Text/Text";

const BIO_MAX = 300;

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
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const form = useForm({ initialValues: { name: "", bio: "" } });

  useEffect(() => {
    if (profile) {
      form.setValues({ name: profile.name, bio: profile.bio });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.artistId, profile?.name, profile?.bio]);

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

  const onPickImage = async (file: File, kind: "avatar" | "cover") => {
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
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
            <div className="relative h-44 bg-page">
              {profile.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-page/40">
                <Button
                  loading={isUploading === "cover"}
                  onClick={() => coverInputRef.current?.click()}
                  leftSection={
                    <IconCamera size={14} className="text-primary" />
                  }
                  className="h-auto rounded-xl bg-surface/90 px-5 py-2.5 text-sm font-medium text-text backdrop-blur hover:bg-surface"
                >
                  Change cover image
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void onPickImage(file, "cover");
                    }
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-3">
              <Text className="text-xs text-text/45">
                Recommended 1600×400px, JPG or PNG
              </Text>
            </div>
          </div>

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
          <div className="rounded-2xl border border-white/5 bg-surface p-7">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-text/80">
              Avatar
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative mb-4 h-28 w-28">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-28 w-28 rounded-full border-4 border-page object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-page bg-primary/15 text-2xl font-semibold text-primary">
                    {profile.name.slice(0, 1)}
                  </div>
                )}
                <button
                  type="button"
                  aria-label="Change avatar"
                  disabled={isUploading === "avatar"}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary hover:brightness-95 disabled:opacity-60"
                >
                  <IconCamera size={14} className="text-textOnPrimary" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void onPickImage(file, "avatar");
                    }
                    event.target.value = "";
                  }}
                />
              </div>
              <Text className="text-center text-xs text-text/45">
                Square image, at least 400×400px
              </Text>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-surface p-7">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-text/80">
              Page status
            </h2>
            <div className="mb-4 flex items-center justify-between">
              <Text className="text-sm text-text/70">Public page</Text>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {profile.hidden ? "Hidden" : "Live"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Text className="text-sm text-text/70">Profile URL</Text>
              <Text className="truncate text-xs text-primary">
                kindred.fm/{profile.handle}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioProfilePage;
