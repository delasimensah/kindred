"use client";

import { Button } from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import React, { useRef } from "react";

import Text from "../../ui/Text/Text";

interface ProfileCoverFieldProps {
  coverUrl: string | null;
  isUploading: boolean;
  onPickFile: (file: File) => void;
}

const ProfileCoverField: React.FC<ProfileCoverFieldProps> = ({
  coverUrl,
  isUploading,
  onPickFile,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
      <div className="relative h-44 bg-page">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-page/40">
          <Button
            loading={isUploading}
            onClick={() => inputRef.current?.click()}
            leftSection={<IconCamera size={14} className="text-primary" />}
            className="h-auto rounded-xl bg-surface/90 px-5 py-2.5 text-sm font-medium text-text backdrop-blur hover:bg-surface"
          >
            Change cover image
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onPickFile(file);
              }
              event.target.value = "";
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-3">
        <Text className="text-xs text-text/45">
          Recommended 1600×400px — crop after you pick
        </Text>
      </div>
    </div>
  );
};

export default ProfileCoverField;
