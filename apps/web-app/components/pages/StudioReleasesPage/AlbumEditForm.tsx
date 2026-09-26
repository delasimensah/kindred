"use client";

import type { Id } from "@convex/_generated/dataModel";
import { Button, Select, TagsInput, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { GENRES } from "shared";

import { ErrorNotification } from "../../feedback/Notification/Notification";
import StudioChoiceCards from "../../ui/StudioChoiceCards/StudioChoiceCards";
import Text from "../../ui/Text/Text";
import { studioFieldClassNames } from "../studioFieldStyles";
import AlbumEditCoverField from "./AlbumEditCoverField";
import AlbumEditTracksSection from "./AlbumEditTracksSection";
import type { AlbumEditSaveValues, EditingAlbum } from "./albumEditTypes";
import { useAlbumTrackEdits } from "./useAlbumTrackEdits";

const GENRE_OPTIONS = GENRES.map((genre) => ({
  value: genre,
  label: genre,
}));

interface AlbumEditFormProps {
  editing: EditingAlbum;
  onClose: () => void;
  onSave: (values: AlbumEditSaveValues) => Promise<void>;
}

const AlbumEditForm: React.FC<AlbumEditFormProps> = ({
  editing,
  onClose,
  onSave,
}) => {
  const [newArtworkFileId, setNewArtworkFileId] = useState<Id<"files"> | null>(
    null
  );
  const [artworkError, setArtworkError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const {
    tracks,
    isAdding,
    busyTrackId,
    onChangeTitle,
    onMove,
    onRemove,
    onAdd,
  } = useAlbumTrackEdits(editing);

  const form = useForm({
    initialValues: {
      title: editing.title,
      description: editing.description ?? "",
      tags: editing.tags,
      genre: editing.genre,
      visibility: editing.visibility,
    },
  });

  const hasCover = newArtworkFileId !== null || editing.artworkUrl !== null;
  const typeLabel = editing.type === "ep" ? "EP" : "Album";

  return (
    <form
      className="space-y-5"
      onSubmit={form.onSubmit((values) => {
        if (!hasCover) {
          setArtworkError("Cover art is required");
          return;
        }
        if (tracks.some((track) => track.title.trim().length === 0)) {
          ErrorNotification({
            title: "Track title required",
            message: "Every track needs a title before you save.",
          });
          return;
        }
        setIsSaving(true);
        void onSave({
          ...values,
          artworkFileId: newArtworkFileId ?? undefined,
          tracks: tracks.map((track) => ({
            trackId: track.trackId,
            title: track.title,
          })),
        }).finally(() => {
          setIsSaving(false);
        });
      })}
    >
      <Text className="text-xs uppercase tracking-wide text-text/45">
        {typeLabel} · {tracks.length} tracks ·{" "}
        {editing.state === "draft"
          ? "Draft"
          : editing.state === "scheduled"
            ? "Scheduled"
            : "Published"}
      </Text>
      <AlbumEditCoverField
        artworkUrl={editing.artworkUrl}
        artworkFileId={newArtworkFileId}
        artworkError={artworkError}
        onArtworkFileId={setNewArtworkFileId}
        onArtworkError={setArtworkError}
      />
      <TextInput
        label="Release title"
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
          name="album-edit-visibility"
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
        rows={3}
        classNames={studioFieldClassNames}
        {...form.getInputProps("description")}
      />
      <AlbumEditTracksSection
        type={editing.type}
        tracks={tracks}
        onChangeTitle={onChangeTitle}
        onMove={(trackId, direction) => {
          void onMove(trackId, direction);
        }}
        onRemove={(trackId) => {
          void onRemove(trackId);
        }}
        onAdd={onAdd}
        isAdding={isAdding}
        busyTrackId={busyTrackId}
      />
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          variant="default"
          onClick={onClose}
          className="w-full rounded-xl border-white/10 bg-transparent sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSaving}
          className="w-full rounded-xl bg-primary text-textOnPrimary sm:w-auto"
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default AlbumEditForm;
