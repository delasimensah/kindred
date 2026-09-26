"use client";

import { Button, Select, TagsInput, Textarea, TextInput } from "@mantine/core";
import { DateInput, TimePicker } from "@mantine/dates";
import type { UseFormReturnType } from "@mantine/form";
import { IconCalendar, IconClock, IconSparkles } from "@tabler/icons-react";
import React from "react";
import { GENRES } from "shared";

import StudioChoiceCards from "../../ui/StudioChoiceCards/StudioChoiceCards";
import Text from "../../ui/Text/Text";
import { studioFieldClassNames } from "../studioFieldStyles";

export type UploadFormValues = {
  title: string;
  description: string;
  tags: string[];
  genre: string;
  visibility: "public" | "supporters";
  publishMode: "now" | "schedule";
  /** YYYY-MM-DD from DateInput */
  scheduleDate: string | null;
  /** HH:mm from TimePicker */
  scheduleTime: string;
};

interface UploadDetailsColumnProps {
  form: UseFormReturnType<UploadFormValues>;
  isSuggesting: boolean;
  onSuggest: () => void;
}

const GENRE_OPTIONS = GENRES.map((genre) => ({
  value: genre,
  label: genre,
}));

const scheduleFieldClassNames = {
  label: "mb-2 text-xs text-text/50",
  input: "rounded-xl border-white/10 bg-page py-3 text-sm text-text",
  section: "text-primary",
  error: "mt-1.5 text-sm text-danger",
  dropdown: "rounded-xl border border-white/10 bg-page p-3 text-text shadow-xl",
  day: "text-text data-[selected]:!bg-primary data-[selected]:!text-textOnPrimary data-[selected]:hover:!bg-primary hover:!bg-primary/15",
  weekday: "text-text/40",
  calendarHeaderControl: "text-text hover:!bg-primary/15",
  calendarHeaderLevel: "text-sm font-medium text-text hover:!bg-primary/15",
  monthsListControl:
    "text-text data-[selected]:!bg-primary data-[selected]:!text-textOnPrimary hover:!bg-primary/15",
  yearsListControl:
    "text-text data-[selected]:!bg-primary data-[selected]:!text-textOnPrimary hover:!bg-primary/15",
  control:
    "text-text hover:!bg-primary/15 data-[selected]:!bg-primary data-[selected]:!text-textOnPrimary",
  controlsList: "bg-page",
  field: "text-text",
  fieldsRoot: "text-text",
};

/** Combine date + time picker values into a local Date for scheduling. */
export function combineScheduleDateTime(
  date: string | null,
  time: string
): Date | null {
  if (date === null || date.trim().length === 0 || time.trim().length === 0) {
    return null;
  }
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  const combined = new Date(`${date.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(combined.getTime())) {
    return null;
  }
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

const UploadDetailsColumn: React.FC<UploadDetailsColumnProps> = ({
  form,
  isSuggesting,
  onSuggest,
}) => {
  return (
    <div className="space-y-6 lg:col-span-3">
      <div className="space-y-6 rounded-2xl border border-white/5 bg-surface p-7">
        <div className="flex items-center justify-between gap-3">
          <Text className="text-sm font-semibold uppercase tracking-wider text-text/80">
            Details
          </Text>
          <Button
            variant="default"
            size="compact-sm"
            loading={isSuggesting}
            leftSection={<IconSparkles size={14} className="text-primary" />}
            onClick={onSuggest}
            className="h-auto rounded-lg border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
          >
            Suggest
          </Button>
        </div>
        <TextInput
          label="Title"
          required
          classNames={studioFieldClassNames}
          {...form.getInputProps("title")}
        />
        <Select
          label="Genre"
          data={GENRE_OPTIONS}
          allowDeselect={false}
          searchable
          nothingFoundMessage="No matching genre"
          classNames={studioFieldClassNames}
          comboboxProps={{ withinPortal: true }}
          {...form.getInputProps("genre")}
        />
        <TagsInput
          label="Tags"
          placeholder="Add tag"
          classNames={studioFieldClassNames}
          {...form.getInputProps("tags")}
        />
        <Textarea
          label="Description"
          rows={4}
          classNames={studioFieldClassNames}
          {...form.getInputProps("description")}
        />
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface p-7">
        <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-text/80">
          Visibility
        </Text>
        <StudioChoiceCards
          name="visibility"
          value={form.values.visibility}
          onChange={(value) => form.setFieldValue("visibility", value)}
          options={[
            {
              value: "public",
              label: "Public",
              description: "Visible to everyone on your page",
            },
            {
              value: "supporters",
              label: "Supporters only",
              description: "Only visible to your supporters",
            },
          ]}
        />
      </div>

      <div className="rounded-2xl border border-white/5 bg-surface p-7">
        <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-text/80">
          Publishing
        </Text>
        <StudioChoiceCards
          name="publish-mode"
          value={form.values.publishMode}
          onChange={(value) => {
            form.setFieldValue("publishMode", value);
            form.clearFieldError("scheduleDate");
            form.clearFieldError("scheduleTime");
          }}
          options={[
            { value: "now", label: "Publish now" },
            { value: "schedule", label: "Schedule" },
          ]}
        />
        {form.values.publishMode === "schedule" ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateInput
              label="Date"
              placeholder="Pick a date"
              minDate={new Date()}
              valueFormat="MMM D, YYYY"
              leftSection={<IconCalendar size={16} />}
              leftSectionWidth={40}
              clearable
              classNames={scheduleFieldClassNames}
              popoverProps={{
                classNames: {
                  dropdown:
                    "rounded-xl border border-white/10 bg-page text-text shadow-xl",
                },
              }}
              {...form.getInputProps("scheduleDate")}
            />
            <TimePicker
              label="Time"
              withDropdown
              minutesStep={5}
              leftSection={<IconClock size={16} />}
              leftSectionWidth={40}
              hoursInputLabel="Hours"
              minutesInputLabel="Minutes"
              classNames={scheduleFieldClassNames}
              popoverProps={{
                classNames: {
                  dropdown:
                    "rounded-xl border border-white/10 bg-page text-text shadow-xl",
                },
              }}
              {...form.getInputProps("scheduleTime")}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UploadDetailsColumn;
