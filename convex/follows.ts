import { v } from "convex/values";

import { requireProfile } from "./lib/auth";
import { bumpFollowerCount } from "./lib/artistStats";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { getFollow } from "./lib/follows";
import { authedMutation, authedQuery } from "./lib/functions";
import { hasActiveSupportRoute, ROUTED_UNFOLLOW_MESSAGE } from "./lib/routes";

export const add = authedMutation({
  args: { artistId: v.id("artists") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null || artist.hidden) {
      raise(ERROR_CODES.INVALID, "Artist not found");
    }
    const existing = await getFollow(ctx, profile._id, args.artistId);
    if (existing !== null) {
      return null;
    }
    await ctx.db.insert("follows", {
      profileId: profile._id,
      artistId: args.artistId,
      createdAt: Date.now(),
    });
    await bumpFollowerCount(ctx, args.artistId, 1);
    return null;
  },
});

export const remove = authedMutation({
  args: { artistId: v.id("artists") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const existing = await getFollow(ctx, profile._id, args.artistId);
    if (existing === null) {
      return null;
    }
    if (await hasActiveSupportRoute(ctx, profile._id, args.artistId)) {
      raise(ERROR_CODES.NOT_PERMITTED, ROUTED_UNFOLLOW_MESSAGE);
    }
    await ctx.db.delete(existing._id);
    await bumpFollowerCount(ctx, args.artistId, -1);
    return null;
  },
});

export const listMine = authedQuery({
  args: {},
  returns: v.array(
    v.object({
      artistId: v.id("artists"),
      name: v.string(),
      avatarUrl: v.union(v.string(), v.null()),
      supporting: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .collect();
    const routes = await ctx.db
      .query("supportRoutes")
      .withIndex("by_profile_active", (q) =>
        q.eq("profileId", profile._id).eq("active", true)
      )
      .collect();
    const supportingIds = new Set(routes.map((route) => route.artistId));
    const seen = new Set<string>();
    const rows = [];
    for (const artistId of [
      ...follows.map((follow) => follow.artistId),
      ...routes.map((route) => route.artistId),
    ]) {
      if (seen.has(artistId)) {
        continue;
      }
      seen.add(artistId);
      const artist = await ctx.db.get(artistId);
      if (artist === null || artist.hidden) {
        continue;
      }
      rows.push({
        artistId: artist._id,
        name: artist.name,
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
        supporting: supportingIds.has(artist._id),
      });
    }
    rows.sort(
      (left, right) => Number(right.supporting) - Number(left.supporting)
    );
    return rows;
  },
});
