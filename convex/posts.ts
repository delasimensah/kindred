import { v } from "convex/values";

import { decidePostAccess, isLocked } from "./lib/access";
import { requireProfile } from "./lib/auth";
import { authedQuery } from "./lib/functions";

const artistPostValidator = v.object({
  postId: v.id("updatePosts"),
  createdAt: v.number(),
  audience: v.union(v.literal("everyone"), v.literal("supporters")),
  body: v.union(v.string(), v.null()),
  locked: v.boolean(),
});

export const listForArtist = authedQuery({
  args: { artistId: v.id("artists") },
  returns: v.array(artistPostValidator),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null || artist.hidden) {
      return [];
    }
    const isOwner = artist.profileId === profile._id;
    const posts = await ctx.db
      .query("updatePosts")
      .withIndex("by_artist_createdAt", (q) => q.eq("artistId", args.artistId))
      .order("desc")
      .take(20);
    const rows = [];
    for (const post of posts) {
      if (post.hidden) {
        continue;
      }
      const locked = isLocked(decidePostAccess(post, isOwner));
      rows.push({
        postId: post._id,
        createdAt: post.createdAt,
        audience: post.audience,
        body: locked ? null : post.body,
        locked,
      });
    }
    return rows;
  },
});
