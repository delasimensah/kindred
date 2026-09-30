import { v } from "convex/values";

import { decideTrackAccess, isLocked } from "./lib/access";
import { requireProfile } from "./lib/auth";
import { fileUrl } from "./lib/files";
import { authedQuery } from "./lib/functions";
import { likedTrackIdSet } from "./lib/library";
import { gateForArtist, loadSupporterAccess } from "./lib/supporterAccess";

const publishedTrackValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  durationMs: v.number(),
  visibility: v.union(v.literal("public"), v.literal("supporters")),
  genre: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  locked: v.boolean(),
  liked: v.boolean(),
});

export const listPublishedForArtist = authedQuery({
  args: {
    artistId: v.id("artists"),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    tracks: v.array(publishedTrackValidator),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    const isOwner = artist?.profileId === profile._id;
    const access = await loadSupporterAccess(ctx, profile._id);
    const gate = gateForArtist(access, args.artistId);
    const cap = args.limit;
    // Collect published first, then drop hidden. Do not take(limit+1) before
    // filtering: a Studio-hidden track in the newest rows would make hasMore
    // false even when many more visible published tracks exist (mobile View all).
    // Drafts and scheduled never enter this index eq on state=published.
    const published = await ctx.db
      .query("tracks")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", args.artistId).eq("state", "published")
      )
      .order("desc")
      .collect();
    const visible = published.filter((track) => !track.hidden);
    const hasMore = cap !== undefined && visible.length > cap;
    const page = cap === undefined ? visible : visible.slice(0, cap);
    const likedIds = await likedTrackIdSet(ctx, profile._id);
    const tracks = [];
    for (const track of page) {
      tracks.push({
        trackId: track._id,
        title: track.title,
        durationMs: track.durationMs,
        visibility: track.visibility,
        genre: track.genre,
        artworkUrl: await fileUrl(ctx, track.artworkFileId),
        locked: isLocked(decideTrackAccess(track, isOwner, gate)),
        liked: likedIds.has(track._id),
      });
    }
    return { tracks, hasMore };
  },
});

const trackDetailValidator = v.object({
  trackId: v.id("tracks"),
  artistId: v.id("artists"),
  title: v.string(),
  artistName: v.string(),
  artistAvatarUrl: v.union(v.string(), v.null()),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
  visibility: v.union(v.literal("public"), v.literal("supporters")),
  description: v.union(v.string(), v.null()),
  locked: v.boolean(),
  liked: v.boolean(),
});

const playbackValidator = v.object({
  audioUrl: v.string(),
  title: v.string(),
  artistId: v.id("artists"),
  artistName: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
  peaks: v.array(v.number()),
});

export const playbackUrl = authedQuery({
  args: { trackId: v.id("tracks") },
  returns: v.union(playbackValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const track = await ctx.db.get(args.trackId);
    if (track === null) {
      return null;
    }
    const artist = await ctx.db.get(track.artistId);
    if (artist === null || artist.hidden) {
      return null;
    }
    const supporter = await loadSupporterAccess(ctx, profile._id);
    const access = decideTrackAccess(
      track,
      artist.profileId === profile._id,
      gateForArtist(supporter, track.artistId)
    );
    if (!access.allowed) {
      return null;
    }
    const audioUrl = await fileUrl(ctx, track.audioFileId);
    if (audioUrl === null) {
      return null;
    }
    return {
      audioUrl,
      title: track.title,
      artistId: artist._id,
      artistName: artist.name,
      artworkUrl: await fileUrl(ctx, track.artworkFileId),
      durationMs: track.durationMs,
      peaks: track.peaks,
    };
  },
});

export const get = authedQuery({
  args: { trackId: v.id("tracks") },
  returns: v.union(trackDetailValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const track = await ctx.db.get(args.trackId);
    if (track === null) {
      return null;
    }
    const artist = await ctx.db.get(track.artistId);
    if (artist === null || artist.hidden) {
      return null;
    }
    const isOwner = artist.profileId === profile._id;
    const supporter = await loadSupporterAccess(ctx, profile._id);
    const access = decideTrackAccess(
      track,
      isOwner,
      gateForArtist(supporter, track.artistId)
    );
    if (!access.allowed && !isLocked(access)) {
      return null;
    }
    const locked = isLocked(access);
    const likedIds = await likedTrackIdSet(ctx, profile._id);
    return {
      trackId: track._id,
      artistId: artist._id,
      title: track.title,
      artistName: artist.name,
      artistAvatarUrl: await fileUrl(ctx, artist.avatarFileId),
      artworkUrl: await fileUrl(ctx, track.artworkFileId),
      durationMs: track.durationMs,
      visibility: track.visibility,
      description: locked ? null : (track.description ?? null),
      locked,
      liked: likedIds.has(track._id),
    };
  },
});
