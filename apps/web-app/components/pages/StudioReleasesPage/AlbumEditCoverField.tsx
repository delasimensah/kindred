"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@mantine/core";
import { useMutation } from "convex/react";
import React, { useRef, useState } from "react";

import { uploadStudioFile } from "@/utils";

import { ErrorNotification } from "../../feedback/Notification/Notification";
import ImageCropModal from "../../media/ImageCropModal/ImageCropModal";
import Text from "../../ui/Text/Text";

interface AlbumEditCoverFieldProps {
  artworkUrl: string | null;
  artworkFileId: Id<"files"> | null;
  artworkError: string | null;
  onArtworkFileId: (fileId: Id<"files">) => void;
  onArtworkError: (message: string | null) => void;
}

const AlbumEditCoverField: React.FC<AlbumEditCoverFieldProps> = ({
  artworkUrl,
  artworkFileId,
  artworkError,
  onArtworkFileId,
  onArtworkError,
}) => {
  const generateUploadUrl = useMutation(api.studioTracks.generateUploadUrl);
  const registerArtwork = useMutation(api.studioTracks.registerArtwork);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(artworkUrl);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropName, setCropName] = useState("artwork.jpg");
  const [isUploadingArt, setIsUploadingArt] = useState(false);

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
      onArtworkFileId(fileId);
      onArtworkError(null);
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

  const hasCover = artworkFileId !== null || artworkUrl !== null;

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
      <div>
        <Text className="mb-2 text-sm text-text/70">Cover art</Text>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-page text-xs text-text/35 sm:h-24 sm:w-24">
              No art
            </div>
          )}
          <div className="min-w-0">
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
        {!hasCover ? (
          <Text className="mt-1.5 text-xs text-text/40">
            Cover art is required to save.
          </Text>
        ) : null}
      </div>
    </>
  );
};

export default AlbumEditCoverField;
