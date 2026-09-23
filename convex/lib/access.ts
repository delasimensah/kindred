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

/**
 * Public published rows are open. A supporters-only row is open only for the
 * owning artist. Entitlement and route rows are not in the schema, so every
 * other caller gets not-entitled.
 */
export function decideTrackAccess(
  track: TrackAccessInput,
  isOwner: boolean
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
  return { allowed: false, reason: "not-entitled" };
}

export function decidePostAccess(
  post: PostAccessInput,
  isOwner: boolean
): AccessDecision {
  if (post.hidden) {
    return { allowed: false, reason: "hidden" };
  }
  if (isOwner || post.audience === "everyone") {
    return { allowed: true };
  }
  return { allowed: false, reason: "not-entitled" };
}

export function isLocked(decision: AccessDecision): boolean {
  return (
    !decision.allowed &&
    (decision.reason === "not-entitled" || decision.reason === "not-routed")
  );
}
