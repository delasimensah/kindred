"use client";

import { Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";

import Skeleton from "../../ui/Skeleton/Skeleton";
import AlbumEditForm from "./AlbumEditForm";
import type { AlbumEditSaveValues, EditingAlbum } from "./albumEditTypes";

export type { AlbumEditSaveValues, EditingAlbum } from "./albumEditTypes";

interface AlbumEditModalProps {
  opened: boolean;
  editing: EditingAlbum | null | undefined;
  onClose: () => void;
  onSave: (values: AlbumEditSaveValues) => Promise<void>;
}

const AlbumEditModal: React.FC<AlbumEditModalProps> = ({
  opened,
  editing,
  onClose,
  onSave,
}) => {
  const isNarrow = useMediaQuery("(max-width: 40em)");
  const fullScreen = isNarrow === true;
  const title =
    editing === undefined || editing === null
      ? "Edit release"
      : editing.type === "ep"
        ? "Edit EP"
        : "Edit album";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered={!fullScreen}
      fullScreen={fullScreen}
      size="xl"
      classNames={{
        content: "bg-surface text-text flex flex-col",
        header: "bg-surface shrink-0 px-4 sm:px-6",
        title: "font-display text-base text-text sm:text-lg",
        close: "text-text/60 hover:bg-white/5 hover:text-text",
        body: fullScreen
          ? "flex-1 overflow-y-auto px-4 pb-6 sm:px-6"
          : "max-h-[min(80vh,720px)] overflow-y-auto px-4 pb-4 sm:px-6",
      }}
    >
      {editing === undefined || editing === null ? (
        <div className="space-y-4" aria-busy aria-label="Loading album">
          <Skeleton className="h-24 w-24 rounded-xl sm:h-28 sm:w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : (
        <AlbumEditForm
          key={editing.releaseId}
          editing={editing}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  );
};

export default AlbumEditModal;
