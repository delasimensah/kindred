/** Client sends a heartbeat this often while audio is actually playing. */
export const PRESENCE_HEARTBEAT_MS = 20_000;

/** A listener counts as present for this long after their last heartbeat. */
export const PRESENCE_FRESH_MS = 60_000;

/** Cleanup cron deletes rows older than this. */
export const PRESENCE_CLEANUP_AFTER_MS = 10 * 60_000;
