"use client";

import { Button, Modal, Slider } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { cropImageToFile } from "@/utils";

import { ErrorNotification } from "../../feedback/Notification/Notification";
import Text from "../../ui/Text/Text";

export type ImageCropKind = "avatar" | "cover";

interface ImageCropModalProps {
  opened: boolean;
  imageSrc: string | null;
  fileName: string;
  kind: ImageCropKind;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const ASPECT: Record<ImageCropKind, number> = {
  avatar: 1,
  cover: 4,
};

const MAX_EDGE: Record<ImageCropKind, number> = {
  avatar: 800,
  cover: 1600,
};

const TITLE: Record<ImageCropKind, string> = {
  avatar: "Crop avatar",
  cover: "Crop cover image",
};

const HINT: Record<ImageCropKind, string> = {
  avatar: "Drag to reposition. Zoom to frame your face.",
  cover: "Drag to reposition. Zoom to frame the banner.",
};

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  opened,
  imageSrc,
  fileName,
  kind,
  onCancel,
  onConfirm,
}) => {
  const isNarrow = useMediaQuery("(max-width: 40em)");
  const fullScreen = isNarrow === true;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }
    setIsApplying(true);
    try {
      const file = await cropImageToFile({
        imageSrc,
        croppedAreaPixels,
        fileName,
        maxEdge: MAX_EDGE[kind],
      });
      onConfirm(file);
    } catch (error) {
      ErrorNotification({
        title: "Could not crop",
        message:
          error instanceof Error
            ? error.message
            : "Try another image or zoom out a bit.",
      });
      setIsApplying(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={TITLE[kind]}
      centered={!fullScreen}
      fullScreen={fullScreen}
      size="lg"
      classNames={{
        content: "bg-surface text-text flex flex-col",
        header: "bg-surface shrink-0 px-4 sm:px-6",
        title: "font-display text-base text-text sm:text-lg",
        close: "text-text/60 hover:bg-white/5 hover:text-text",
        body: fullScreen
          ? "flex-1 overflow-y-auto px-4 pb-6 sm:px-6"
          : "px-4 pb-4 sm:px-6",
      }}
    >
      <Text className="mb-4 text-sm text-text/55">{HINT[kind]}</Text>
      <div className="relative mb-5 h-64 overflow-hidden rounded-xl bg-page sm:h-80">
        {imageSrc ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT[kind]}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={false}
            classes={{
              containerClassName: "rounded-xl",
            }}
          />
        ) : null}
      </div>
      <div className="mb-6 px-1">
        <Text className="mb-2 text-xs text-text/45">Zoom</Text>
        <Slider
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={setZoom}
          label={(value) => `${Math.round(value * 100)}%`}
          color="yellow"
        />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="default"
          onClick={onCancel}
          disabled={isApplying}
          className="w-full rounded-xl border-white/10 bg-transparent text-text/70 sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          loading={isApplying}
          disabled={!croppedAreaPixels}
          onClick={() => void handleApply()}
          className="w-full rounded-xl bg-primary text-textOnPrimary hover:brightness-95 sm:w-auto"
        >
          Use this crop
        </Button>
      </div>
    </Modal>
  );
};

export default ImageCropModal;
