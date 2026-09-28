"use client";

import React from "react";

import Heading from "../ui/Heading/Heading";
import Text from "../ui/Text/Text";

const PublicMissing: React.FC = () => {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <Heading variant="section" className="mb-3 text-2xl">
        This page is not available
      </Heading>
      <Text className="text-sm text-text/60">
        It may be hidden, or it is not published yet.
      </Text>
    </main>
  );
};

export default PublicMissing;
