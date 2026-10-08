import React from "react";
import { getDisplayInitials } from "shared";

interface PersonAvatarProps {
  displayName: string;
  imageUrl?: string | null;
  className?: string;
}

const PersonAvatar: React.FC<PersonAvatarProps> = ({
  displayName,
  imageUrl,
  className = "h-9 w-9 text-xs",
}) => {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className={`shrink-0 rounded-full bg-page object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold uppercase text-primary ${className}`}
    >
      {getDisplayInitials(displayName)}
    </span>
  );
};

export default PersonAvatar;
