"use client";

import { IconDeviceMobile } from "@tabler/icons-react";
import React from "react";

import { useGetAppPrompt } from "./getAppPromptStore";

interface GetTheAppButtonProps {
  className: string;
  label?: string;
  iconSize?: number;
}

const GetTheAppButton: React.FC<GetTheAppButtonProps> = ({
  className,
  label,
  iconSize,
}) => {
  const openPrompt = useGetAppPrompt((state) => state.openPrompt);
  return (
    <button
      type="button"
      onClick={openPrompt}
      aria-label={label}
      className={`transition motion-safe:active:scale-[0.97] ${className}`}
    >
      {iconSize !== undefined ? (
        <IconDeviceMobile size={iconSize} aria-hidden />
      ) : null}
      Get the app
    </button>
  );
};

export default GetTheAppButton;
