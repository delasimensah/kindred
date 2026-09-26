"use client";

import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@mantine/core";
import React from "react";

type ReleaseState = "draft" | "scheduled" | "published";

interface ReleaseRowActionsProps {
  trackId: Id<"tracks">;
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
            variant="default"
            size="compact-sm"
            onClick={onPublishNow}
            className={actionClassName}
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
            className={actionClassName}
          >
            Cancel schedule
          </Button>
        </>
      ) : null}
      <Button
        variant="default"
        size="compact-sm"
        onClick={onToggleHidden}
        className={actionClassName}
      >
        {hidden ? "Unhide" : "Hide"}
      </Button>
    </div>
  );
};

export default ReleaseRowActions;
