"use client";

import { Button } from "@mantine/core";
import { IconCloudUpload } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import Heading from "../../ui/Heading/Heading";
import Text from "../../ui/Text/Text";

type Filter = "all" | "scheduled" | "published" | "draft" | "hidden";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "hidden", label: "Hidden" },
];

interface ReleasesPageHeaderProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const ReleasesPageHeader: React.FC<ReleasesPageHeaderProps> = ({
  filter,
  onFilterChange,
}) => {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading
            variant="page"
            className="mb-0 font-display text-[28px] font-medium leading-tight text-text"
          >
            Releases
          </Heading>
          <Text className="mt-1.5 text-sm text-text/50">
            Manage every single on your page.
          </Text>
        </div>
        <Button
          component={Link}
          href="/upload"
          leftSection={<IconCloudUpload size={14} />}
          className="h-auto rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95"
        >
          Upload release
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onFilterChange(item.value)}
            className={
              filter === item.value
                ? "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-textOnPrimary"
                : "rounded-lg px-4 py-2 text-sm font-medium text-text/60 transition hover:bg-white/5"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

export type { Filter };
export default ReleasesPageHeader;
