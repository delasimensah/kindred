"use client";

import React from "react";

import { ASSETS } from "@/constants";

import Text from "../../ui/Text/Text";

const StudioWordmark: React.FC = () => {
  return (
    <div className="mb-8 flex flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.icons.logo}
        alt="Kindred"
        width={48}
        height={48}
        className="mb-4 h-12 w-12 rounded-xl"
        decoding="async"
      />
      <Text className="text-xs uppercase tracking-[0.2em] text-text/50">
        Artist Studio
      </Text>
    </div>
  );
};

export default StudioWordmark;
