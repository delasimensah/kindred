import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function likedTrackIdSet(
  ctx: QueryCtx,
  profileId: Id<"profiles">
): Promise<Set<Id<"tracks">>> {
  const rows = await ctx.db
    .query("libraryItems")
    .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profileId))
    .collect();
  const ids = new Set<Id<"tracks">>();
  for (const row of rows) {
    if (row.kind === "liked") {
      ids.add(row.trackId);
    }
  }
  return ids;
}
