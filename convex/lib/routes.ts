import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const ROUTED_UNFOLLOW_MESSAGE = "Remove this artist from support first.";

export async function hasActiveSupportRoute(
  ctx: QueryCtx | MutationCtx,
  profileId: Id<"profiles">,
  artistId: Id<"artists">
): Promise<boolean> {
  const routes = await ctx.db
    .query("supportRoutes")
    .withIndex("by_profile_artist", (q) =>
      q.eq("profileId", profileId).eq("artistId", artistId)
    )
    .collect();
  return routes.some((route) => route.active);
}
