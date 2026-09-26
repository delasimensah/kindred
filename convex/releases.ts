import { v } from "convex/values";

import { decideTrackAccess, isLocked } from "./lib/access";
import { requireProfile } from "./lib/auth";
import { fileUrl } from "./lib/files";
import { authedQuery } from "./lib/functions";
import { likedTrackIdSet } from "./lib/library";

const albumSummaryValidator = v.object({
  releaseId: v.id("releases"),
  title: v.string(),
  type: v.union(v.literal("ep"), v.literal("album")),
  artworkUrl: v.union(v.string(), v.null()),
  trackCount: v.number(),
});

const albumTrackValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  durationMs: v.number(),
  visibility: v.union(v.literal("public"), v.literal("supporters")),
  artworkUrl: v.union(v.string(), v.null()),
  locked: v.boolean(),
  liked: v.boolean(),
  position: v.number(),
});

export const listPublishedForArtist = authedQuery({
  args: {
    artistId: v.id("artists"),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    albums: v.array(albumSummaryValidator),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null || artist.hidden) {
      return { albums: [], hasMore: false };
    }
    const published = await ctx.db
      .query("releases")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", args.artistId).eq("state", "published")
      )
      .order("desc")
      .collect();
    const visible = published.filter((release) => !release.hidden);
    const cap = args.limit;
    const hasMore = cap !== undefined && visible.length > cap;
    const page = cap === undefined ? visible : visible.slice(0, cap);
    const albums = [];
    for (const release of page) {
      const members = await ctx.db
        .query("tracks")
        .withIndex("by_release_position", (q) => q.eq("releaseId", release._id))
        .collect();
      const trackCount = members.filter((track) => !track.hidden).length;
      albums.push({
        releaseId: release._id,
        title: release.title,
        type: release.type,
        artworkUrl: await fileUrl(ctx, release.artworkFileId),
        trackCount,
      });
    }
    return { albums, hasMore };
  },
});

export const get = authedQuery({
  args: { releaseId: v.id("releases") },
  returns: v.union(
    v.object({
      releaseId: v.id("releases"),
      artistId: v.id("artists"),
      title: v.string(),
      type: v.union(v.literal("ep"), v.literal("album")),
      artistName: v.string(),
      artworkUrl: v.union(v.string(), v.null()),
      trackCount: v.number(),
      tracks: v.array(albumTrackValidator),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const release = await ctx.db.get(args.releaseId);
    if (release === null || release.hidden || release.state !== "published") {
      return null;
    }
    const artist = await ctx.db.get(release.artistId);
    if (artist === null || artist.hidden) {
      return null;
    }
    const isOwner = artist.profileId === profile._id;
    const members = await ctx.db
      .query("tracks")
      .withIndex("by_release_position", (q) => q.eq("releaseId", release._id))
      .collect();
    members.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const likedIds = await likedTrackIdSet(ctx, profile._id);
    const tracks = [];
    for (const track of members) {
      if (track.hidden) {
        continue;
      }
      tracks.push({
        trackId: track._id,
        title: track.title,
        durationMs: track.durationMs,
        visibility: track.visibility,
        artworkUrl: await fileUrl(ctx, track.artworkFileId),
        locked: isLocked(decideTrackAccess(track, isOwner)),
        liked: likedIds.has(track._id),
        position: track.position ?? 0,
      });
    }
    return {
      releaseId: release._id,
      artistId: artist._id,
      title: release.title,
      type: release.type,
      artistName: artist.name,
      artworkUrl: await fileUrl(ctx, release.artworkFileId),
      trackCount: tracks.length,
      tracks,
    };
  },
});
