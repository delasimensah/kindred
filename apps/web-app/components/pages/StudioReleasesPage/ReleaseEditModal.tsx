"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Button,
  Modal,
  Select,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "convex/react";
import React, { useRef, useState } from "react";
import { GENRES } from "shared";

import { uploadStudioFile } from "@/utils";

import { ErrorNotification } from "../../feedback/Notification/Notification";
import ImageCropModal from "../../media/ImageCropModal/ImageCropModal";
import Skeleton from "../../ui/Skeleton/Skeleton";
import StudioChoiceCards from "../../ui/StudioChoiceCards/StudioChoiceCards";
import Text from "../../ui/Text/Text";
import { studioFieldClassNames } from "../studioFieldStyles";

type EditingTrack = {
  trackId: Id<"tracks">;
  title: string;
  description: string | null;
  tags: string[];
  genre: string;
  visibility: "public" | "supporters";
  artworkUrl: string | null;
};

export type ReleaseEditSaveValues = {
  title: string;
  description: string;
  tags: string[];
  genre: string;
  visibility: "public" | "supporters";
  artworkFileId?: Id<"files">;
};

interface ReleaseEditModalProps {
  opened: boolean;
  editing: EditingTrack | null | undefined;
  onClose: () => void;
  onSave: (values: ReleaseEditSaveValues) => Promise<void>;
}

const GENRE_OPTIONS = GENRES.map((genre) => ({
  value: genre,
  label: genre,
}));

interface ReleaseEditFormProps {
  editing: EditingTrack;
  onClose: () => void;
  onSave: (values: ReleaseEditSaveValues) => Promise<void>;
}

const ReleaseEditForm: React.FC<ReleaseEditFormProps> = ({
  editing,
  onClose,
  onSave,
}) => {
  const generateUploadUrl = useMutation(api.studioTracks.generateUploadUrl);
  const registerArtwork = useMutation(api.studioTracks.registerArtwork);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    editing.artworkUrl
  );
  const [newArtworkFileId, setNewArtworkFileId] = useState<Id<"files"> | null>(
    null
  );
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropName, setCropName] = useState("artwork.jpg");
  const [isUploadingArt, setIsUploadingArt] = useState(false);

  const form = useForm({
    initialValues: {
      title: editing.title,
      description: editing.description ?? "",
      tags: editing.tags,
      genre: editing.genre,
      visibility: editing.visibility,
    },
  });

  const onArtworkCropped = async (file: File) => {
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
    }
    setCropSrc(null);
    setIsUploadingArt(true);
    try {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      const fileId = await uploadStudioFile({
        file,
        generateUrl: () => generateUploadUrl({}),
        register: (payload) => registerArtwork(payload),
      });
      setNewArtworkFileId(fileId);
      setArtworkError(null);
    } catch (error) {
      ErrorNotification({
        title: "Artwork upload failed",
        message:
          error instanceof Error ? error.message : "Try another image file.",
      });
    } finally {
      setIsUploadingArt(false);
    }
  };

  const hasCover = newArtworkFileId !== null || editing.artworkUrl !== null;

  return (
    <>
      {cropSrc ? (
        <ImageCropModal
          key={cropSrc}
          opened
          imageSrc={cropSrc}
          fileName={cropName}
          kind="avatar"
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onConfirm={(file) => {
            void onArtworkCropped(file);
          }}
        />
      ) : null}
      <form
        className="space-y-4"
        onSubmit={form.onSubmit((values) => {
          if (!hasCover) {
            setArtworkError("Cover art is required");
            return;
          }
          void onSave({
            ...values,
            artworkFileId: newArtworkFileId ?? undefined,
          });
        })}
      >
        <div>
          <Text className="mb-2 text-sm text-text/70">Cover art</Text>
          <div className="flex items-center gap-4">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-page text-xs text-text/35">
                No art
              </div>
            )}
            <div>
              <Button
                type="button"
                variant="default"
                loading={isUploadingArt}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-white/10 bg-transparent text-sm text-text/80"
              >
                {previewUrl ? "Change cover" : "Add cover"}
              </Button>
              <Text className="mt-1.5 text-xs text-text/40">
                Square crop after you pick
              </Text>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  if (cropSrc) {
                    URL.revokeObjectURL(cropSrc);
                  }
                  setCropName(file.name);
                  setCropSrc(URL.createObjectURL(file));
                }
                event.target.value = "";
              }}
            />
          </div>
          {artworkError !== null ? (
            <Text className="mt-1.5 text-sm text-danger">{artworkError}</Text>
          ) : null}
        </div>
        <TextInput
          label="Title"
          classNames={studioFieldClassNames}
          {...form.getInputProps("title")}
        />
        <Select
          label="Genre"
          data={GENRE_OPTIONS}
          allowDeselect={false}
          searchable
          nothingFoundMessage="No matching genre"
          classNames={studioFieldClassNames}
          comboboxProps={{ withinPortal: true }}
          {...form.getInputProps("genre")}
        />
        <div>
          <Text className="mb-2 text-sm text-text/70">Visibility</Text>
          <StudioChoiceCards
            name="edit-visibility"
            value={form.values.visibility}
            onChange={(value) => form.setFieldValue("visibility", value)}
            options={[
              {
                value: "public",
                label: "Public",
                description: "Visible to everyone on your page",
              },
              {
                value: "supporters",
                label: "Supporters only",
                description: "Only visible to your supporters",
              },
            ]}
          />
        </div>
        <TagsInput
          label="Tags"
          classNames={studioFieldClassNames}
          {...form.getInputProps("tags")}
        />
        <Textarea
          label="Description"
          rows={4}
          classNames={studioFieldClassNames}
          {...form.getInputProps("description")}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="default"
            onClick={onClose}
            className="rounded-xl border-white/10 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl bg-primary text-textOnPrimary"
          >
            Save
          </Button>
        </div>
      </form>
    </>
  );
};

const ReleaseEditModal: React.FC<ReleaseEditModalProps> = ({
  opened,
  editing,
  onClose,
  onSave,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit release"
      centered
      classNames={{
        content: "bg-surface text-text",
        header: "bg-surface",
        title: "font-display text-lg text-text",
        close: "text-text/60 hover:bg-white/5 hover:text-text",
      }}
    >
      {editing === undefined || editing === null ? (
        <div className="space-y-4" aria-busy aria-label="Loading release">
          <Skeleton className="h-28 w-28 rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ) : (
        <ReleaseEditForm
          key={editing.trackId}
          editing={editing}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
};

export default ReleaseEditModal;
