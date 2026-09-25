/** Keep in lockstep with packages/shared/src/constants/presence.ts */
export const PRESENCE_HEARTBEAT_MS = 20_000;
export const PRESENCE_FRESH_MS = 60_000;
export const PRESENCE_CLEANUP_AFTER_MS = 10 * 60_000;

export function presenceCutoff(now: number = Date.now()): number {
  return now - PRESENCE_FRESH_MS;
}

export function presenceCleanupCutoff(now: number = Date.now()): number {
  return now - PRESENCE_CLEANUP_AFTER_MS;
}
