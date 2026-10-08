"use client";

import { Button } from "@mantine/core";
import React from "react";

type ReleaseState = "draft" | "scheduled" | "published";

interface ReleaseRowActionsProps {
  state: ReleaseState;
  hidden: boolean;
  onEdit: () => void;
  onPublishNow: () => void;
  onSchedule: () => void;
  onChangeSchedule: () => void;
  onCancelSchedule: () => void;
  onToggleHidden: () => void;
}

const actionClassName =
  "rounded-lg border-white/10 bg-transparent text-xs text-text/70";
const primaryClassName =
  "rounded-lg bg-primary text-xs font-semibold text-textOnPrimary hover:bg-primary/90";
const dangerClassName =
  "rounded-lg border-white/10 bg-transparent text-xs text-danger";

const ReleaseRowActions: React.FC<ReleaseRowActionsProps> = ({
  state,
  hidden,
  onEdit,
  onPublishNow,
  onSchedule,
  onChangeSchedule,
  onCancelSchedule,
  onToggleHidden,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="default"
        size="compact-sm"
        onClick={onEdit}
        className={actionClassName}
      >
        Edit
      </Button>
      {state === "draft" && !hidden ? (
        <>
          <Button
            variant="filled"
            size="compact-sm"
            onClick={onPublishNow}
            className={primaryClassName}
          >
            Publish now
          </Button>
          <Button
            variant="default"
            size="compact-sm"
            onClick={onSchedule}
            className={actionClassName}
          >
            Schedule
          </Button>
        </>
      ) : null}
      {state === "scheduled" && !hidden ? (
        <>
          <Button
            variant="default"
            size="compact-sm"
            onClick={onChangeSchedule}
            className={actionClassName}
          >
            Change schedule
          </Button>
          <Button
            variant="default"
            size="compact-sm"
            onClick={onCancelSchedule}
            className={dangerClassName}
          >
            Cancel schedule
          </Button>
        </>
      ) : null}
      <Button
        variant="default"
        size="compact-sm"
        onClick={onToggleHidden}
        className={hidden ? actionClassName : dangerClassName}
      >
        {hidden ? "Unhide" : "Hide"}
      </Button>
    </div>
  );
};

export default ReleaseRowActions;
