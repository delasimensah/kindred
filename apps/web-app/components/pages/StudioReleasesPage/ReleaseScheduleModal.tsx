"use client";

import { Button, Modal } from "@mantine/core";
import { DateInput, TimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import React, { useEffect } from "react";

import { splitPublishAt, submitScheduleForm } from "./releaseSchedule";

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
  control:
    "text-text hover:!bg-primary/15 data-[selected]:!bg-primary data-[selected]:!text-textOnPrimary",
  controlsList: "bg-page",
  field: "text-text",
  fieldsRoot: "text-text",
};

interface ReleaseScheduleModalProps {
  opened: boolean;
  title: string;
  /** Existing publishAt when changing a schedule; null for a fresh schedule. */
  initialPublishAt: number | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (publishAtMs: number) => Promise<void>;
}

const ReleaseScheduleModal: React.FC<ReleaseScheduleModalProps> = ({
  opened,
  title,
  initialPublishAt,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const form = useForm({
    initialValues: splitPublishAt(initialPublishAt),
  });

  useEffect(() => {
    if (opened) {
      form.setValues(splitPublishAt(initialPublishAt));
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialPublishAt]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      classNames={{
        content: "bg-surface text-text",
        header: "bg-surface",
        title: "font-display text-lg text-text",
        close: "text-text/60 hover:bg-white/5 hover:text-text",
      }}
    >
      <form
        className="space-y-4"
        onSubmit={form.onSubmit((values) => {
          form.clearErrors();
          submitScheduleForm(
            values,
            (publishAtMs) => {
              void onConfirm(publishAtMs);
            },
            form.setErrors
          );
        })}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="default"
            onClick={onClose}
            className="w-full rounded-xl border-white/10 bg-transparent sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full rounded-xl bg-primary text-textOnPrimary sm:w-auto"
          >
            Save schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReleaseScheduleModal;
