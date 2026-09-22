import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function countFollowsForProfile(
  ctx: QueryCtx | MutationCtx,
  profileId: Id<"profiles">
): Promise<number> {
  const follows = await ctx.db
    .query("follows")
    .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profileId))
    .collect();
  return follows.length;
}

export async function getFollow(
  ctx: QueryCtx | MutationCtx,
  profileId: Id<"profiles">,
  artistId: Id<"artists">
) {
  return await ctx.db
    .query("follows")
    .withIndex("by_profile_artist", (q) =>
      q.eq("profileId", profileId).eq("artistId", artistId)
    )
    .unique();
}
