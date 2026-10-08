"use client";

import { Button, TextInput } from "@mantine/core";
import { IconCloudUpload, IconSearch } from "@tabler/icons-react";
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
  search: string;
  onSearchChange: (search: string) => void;
}

const ReleasesPageHeader: React.FC<ReleasesPageHeaderProps> = ({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}) => {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading
            variant="page"
            className="mb-0 font-display text-2xl font-medium leading-tight text-text sm:text-[28px]"
          >
            Releases
          </Heading>
          <Text className="mt-1.5 text-sm text-text/50">
            Singles, EPs, and albums — edit details, tracks, and publish state.
          </Text>
        </div>
        <Button
          component={Link}
          href="/upload"
          leftSection={<IconCloudUpload size={14} />}
          className="h-auto w-full shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-textOnPrimary hover:brightness-95 sm:w-auto"
        >
          Upload release
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
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
        <TextInput
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="Search your releases"
          aria-label="Search your releases"
          leftSection={<IconSearch size={16} />}
          leftSectionWidth={40}
          className="w-full lg:w-72"
          classNames={{
            input:
              "rounded-xl border-white/10 bg-surface text-sm text-text placeholder:text-text/35 focus:border-primary/60",
            section: "text-text/40",
          }}
        />
      </div>
    </>
  );
};

export type { Filter };
export default ReleasesPageHeader;
