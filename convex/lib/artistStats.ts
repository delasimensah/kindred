import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function getArtistStats(
  ctx: MutationCtx,
  artistId: Id<"artists">
) {
  return await ctx.db
    .query("artistStats")
    .withIndex("by_artistId", (q) => q.eq("artistId", artistId))
    .unique();
}

export async function bumpFollowerCount(
  ctx: MutationCtx,
  artistId: Id<"artists">,
  delta: 1 | -1
): Promise<void> {
  const stats = await getArtistStats(ctx, artistId);
  if (stats === null) {
    return;
  }
  const next = Math.max(0, stats.followerCount + delta);
  await ctx.db.patch(stats._id, {
    followerCount: next,
    updatedAt: Date.now(),
  });
}
