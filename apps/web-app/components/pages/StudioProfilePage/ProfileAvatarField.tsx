"use client";

import { IconCamera } from "@tabler/icons-react";
import React, { useRef } from "react";

import Text from "../../ui/Text/Text";

interface ProfileAvatarFieldProps {
  avatarUrl: string | null;
  displayName: string;
  isUploading: boolean;
  onPickFile: (file: File) => void;
}

const ProfileAvatarField: React.FC<ProfileAvatarFieldProps> = ({
  avatarUrl,
  displayName,
  isUploading,
  onPickFile,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-7">
      <h2 className="mb-5 text-base font-semibold text-text">Avatar</h2>
      <div className="flex flex-col items-center">
        <div className="relative mb-4 h-28 w-28">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-28 w-28 rounded-full border-4 border-page object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-page bg-primary/15 text-2xl font-semibold text-primary">
              {displayName.slice(0, 1)}
            </div>
          )}
          <button
            type="button"
            aria-label="Change avatar"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-primary hover:brightness-95 disabled:opacity-60"
          >
            <IconCamera size={14} className="text-textOnPrimary" />
          </button>
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
        <Text className="text-center text-xs text-text/45">
          Square image — crop after you pick
        </Text>
      </div>
    </div>
  );
};

export default ProfileAvatarField;
