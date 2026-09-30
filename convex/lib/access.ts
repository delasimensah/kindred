export type AccessDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: "not-entitled" | "not-routed" | "hidden" | "unpublished";
    };

interface TrackAccessInput {
  hidden: boolean;
  state: "draft" | "scheduled" | "published";
  visibility: "public" | "supporters";
}

interface PostAccessInput {
  hidden: boolean;
  audience: "everyone" | "supporters";
}

export type SupportGate = {
  entitled: boolean;
  routed: boolean;
};

/**
 * Public published rows are open. A supporters-only row opens for the owning
 * artist, or for a paying supporter who currently routes that artist.
 * Omit the gate and the row stays locked.
 */
export function decideTrackAccess(
  track: TrackAccessInput,
  isOwner: boolean,
  gate?: SupportGate
): AccessDecision {
  if (track.hidden) {
    return { allowed: false, reason: "hidden" };
  }
  if (isOwner) {
    return { allowed: true };
  }
  if (track.state !== "published") {
    return { allowed: false, reason: "unpublished" };
  }
  if (track.visibility === "public") {
    return { allowed: true };
  }
  if (gate?.entitled !== true) {
    return { allowed: false, reason: "not-entitled" };
  }
  if (gate.routed !== true) {
    return { allowed: false, reason: "not-routed" };
  }
  return { allowed: true };
}

export function decidePostAccess(
  post: PostAccessInput,
  isOwner: boolean,
  gate?: SupportGate
): AccessDecision {
  if (post.hidden) {
    return { allowed: false, reason: "hidden" };
  }
  if (isOwner || post.audience === "everyone") {
    return { allowed: true };
  }
  if (gate?.entitled !== true) {
    return { allowed: false, reason: "not-entitled" };
  }
  if (gate.routed !== true) {
    return { allowed: false, reason: "not-routed" };
  }
  return { allowed: true };
}

export function isLocked(decision: AccessDecision): boolean {
  return (
    !decision.allowed &&
    (decision.reason === "not-entitled" || decision.reason === "not-routed")
  );
}
