"use client";

import React from "react";

import Heading from "../ui/Heading/Heading";
import Text from "../ui/Text/Text";

const PublicLoadFailed: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
        !
      </div>
      <Heading variant="section" className="mb-2 text-xl">
        Couldn&apos;t load this page
      </Heading>
      <Text className="mb-6 max-w-[240px] text-sm leading-relaxed text-text/45">
        Check your connection and try again.
      </Text>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-textOnPrimary"
      >
        Try again
      </button>
    </main>
  );
};

export default PublicLoadFailed;
