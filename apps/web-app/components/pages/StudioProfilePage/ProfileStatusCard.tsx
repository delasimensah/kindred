"use client";

import React from "react";

import Text from "../../ui/Text/Text";

interface ProfileStatusCardProps {
  handle: string;
  hidden: boolean;
}

const ProfileStatusCard: React.FC<ProfileStatusCardProps> = ({
  handle,
  hidden,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-7">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-text/80">
        Page status
      </h2>
      <div className="mb-4 flex items-center justify-between">
        <Text className="text-sm text-text/70">Public page</Text>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {hidden ? "Hidden" : "Live"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Text className="text-sm text-text/70">Profile URL</Text>
        <Text className="truncate text-xs text-primary">
          kindred.fm/{handle}
        </Text>
      </div>
    </div>
  );
};

export default ProfileStatusCard;
