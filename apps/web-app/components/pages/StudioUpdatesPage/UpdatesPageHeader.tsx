"use client";

import { Button } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

const UpdatesPageHeader: React.FC = () => {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Heading
          variant="page"
          className="mb-0 font-display text-2xl font-medium leading-tight text-text sm:text-[28px]"
        >
          Updates
        </Heading>
        <Text className="mt-1.5 text-sm text-text/50">
          Everything you&apos;ve shared with your supporters and fans.
        </Text>
      </div>
      <Button
        component={Link}
        href="/updates/compose"
        leftSection={<IconPencil size={14} />}
        className="h-auto w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95 sm:w-auto"
      >
        Compose update
      </Button>
    </div>
  );
};

export default UpdatesPageHeader;
