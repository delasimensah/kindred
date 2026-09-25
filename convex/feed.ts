import { v } from "convex/values";

import { decidePostAccess, decideTrackAccess, isLocked } from "./lib/access";
import { requireProfile } from "./lib/auth";
import { fileUrl } from "./lib/files";
import { authedQuery } from "./lib/functions";

const postItem = v.object({
  kind: v.literal("post"),
  postId: v.id("updatePosts"),
  artistId: v.id("artists"),
  artistName: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  createdAt: v.number(),
  audience: v.union(v.literal("everyone"), v.literal("supporters")),
  body: v.union(v.string(), v.null()),
  locked: v.boolean(),
  photoUrl: v.union(v.string(), v.null()),
  voiceDurationMs: v.union(v.number(), v.null()),
  voiceUrl: v.union(v.string(), v.null()),
  voicePeaks: v.array(v.number()),
});

const releaseItem = v.object({
  kind: v.literal("release"),
  trackId: v.id("tracks"),
  artistId: v.id("artists"),
  artistName: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  createdAt: v.number(),
  title: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
  locked: v.boolean(),
  peaks: v.array(v.number()),
});

const POSTS_PER_ARTIST = 8;

/**
 * Newest posts and one newest release from each followed artist.
 * A merged list cannot use one table cursor, so the page is capped.
 */
export const listForMe = authedQuery({
  args: {},
  returns: v.array(v.union(postItem, releaseItem)),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .collect();
    const items = [];
    for (const follow of follows) {
      const artist = await ctx.db.get(follow.artistId);
      if (artist === null || artist.hidden) {
        continue;
      }
      const isOwner = artist.profileId === profile._id;
      const avatarUrl = await fileUrl(ctx, artist.avatarFileId);
      const posts = await ctx.db
        .query("updatePosts")
        .withIndex("by_artist_createdAt", (q) => q.eq("artistId", artist._id))
        .order("desc")
        .take(POSTS_PER_ARTIST);
      for (const post of posts) {
        if (post.hidden) {
          continue;
        }
        const locked = isLocked(decidePostAccess(post, isOwner));
        items.push({
          kind: "post" as const,
          postId: post._id,
          artistId: artist._id,
          artistName: artist.name,
          avatarUrl,
          createdAt: post.createdAt,
          audience: post.audience,
          body: locked ? null : post.body,
          locked,
          photoUrl: locked ? null : await fileUrl(ctx, post.photoFileId),
          voiceDurationMs: locked ? null : (post.voiceDurationMs ?? null),
          voiceUrl: locked ? null : await fileUrl(ctx, post.voiceFileId),
          voicePeaks: locked ? [] : (post.voicePeaks ?? []),
        });
      }
      const release = await ctx.db
        .query("tracks")
        .withIndex("by_artist_state_publishedAt", (q) =>
          q.eq("artistId", artist._id).eq("state", "published")
        )
        .order("desc")
        .first();
      if (release !== null && !release.hidden) {
        items.push({
          kind: "release" as const,
          trackId: release._id,
          artistId: artist._id,
          artistName: artist.name,
          avatarUrl,
          createdAt: release.publishedAt ?? release.createdAt,
          title: release.title,
          artworkUrl: await fileUrl(ctx, release.artworkFileId),
          durationMs: release.durationMs,
          locked: isLocked(decideTrackAccess(release, isOwner)),
          peaks: release.peaks,
        });
      }
    }
    items.sort((left, right) => right.createdAt - left.createdAt);
    return items.slice(0, 40);
  },
});
