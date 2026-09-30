import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { decideTrackAccess, isLocked } from "./lib/access";
import {
  gateForArtist,
  loadSupporterAccess,
  type SupporterAccess,
} from "./lib/supporterAccess";
import { requireProfile } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { authedMutation, authedQuery } from "./lib/functions";
import { likedTrackIdSet } from "./lib/library";

const libraryTrackValidator = v.object({
  trackId: v.id("tracks"),
  artistId: v.id("artists"),
  title: v.string(),
  artistName: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
  locked: v.boolean(),
  liked: v.boolean(),
});

const MAX_NAME_LENGTH = 80;
const ADDABLE_LIMIT = 40;
const COVER_ART_LIMIT = 4;

export const listLiked = authedQuery({
  args: {},
  returns: v.array(libraryTrackValidator),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const supporter = await loadSupporterAccess(ctx, profile._id);
    const items = await ctx.db
      .query("libraryItems")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .collect();
    const tracks = [];
    for (const item of items) {
      if (item.kind !== "liked") {
        continue;
      }
      const row = await presentTrack(
        ctx,
        item.trackId,
        profile._id,
        true,
        supporter
      );
      if (row !== null) {
        tracks.push(row);
      }
    }
    return tracks;
  },
});

export const isLiked = authedQuery({
  args: { trackId: v.id("tracks") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const rows = await ctx.db
      .query("libraryItems")
      .withIndex("by_profile_track", (q) =>
        q.eq("profileId", profile._id).eq("trackId", args.trackId)
      )
      .collect();
    return rows.some((row) => row.kind === "liked");
  },
});

export const setLiked = authedMutation({
  args: { trackId: v.id("tracks"), liked: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const track = await publishedTrack(ctx, args.trackId);
    const existing = await ctx.db
      .query("libraryItems")
      .withIndex("by_profile_track", (q) =>
        q.eq("profileId", profile._id).eq("trackId", track._id)
      )
      .collect();
    const like = existing.find((row) => row.kind === "liked");
    if (args.liked && like === undefined) {
      await ctx.db.insert("libraryItems", {
        profileId: profile._id,
        trackId: track._id,
        kind: "liked",
        createdAt: Date.now(),
      });
    }
    if (!args.liked && like !== undefined) {
      await ctx.db.delete(like._id);
    }
    return null;
  },
});

export const listPlaylists = authedQuery({
  args: {},
  returns: v.array(
    v.object({
      playlistId: v.id("playlists"),
      name: v.string(),
      trackCount: v.number(),
      artworkUrls: v.array(v.string()),
    })
  ),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const playlists = await ctx.db
      .query("playlists")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .collect();
    const rows = [];
    for (const playlist of playlists) {
      const entries = await ctx.db
        .query("playlistEntries")
        .withIndex("by_playlist_position", (q) =>
          q.eq("playlistId", playlist._id)
        )
        .collect();
      rows.push({
        playlistId: playlist._id,
        name: playlist.name,
        trackCount: entries.length,
        artworkUrls: await coverArtworkUrls(ctx, entries),
      });
    }
    return rows;
  },
});

export const createPlaylist = authedMutation({
  args: { name: v.string() },
  returns: v.id("playlists"),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const name = args.name.trim();
    if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
      raise(ERROR_CODES.INVALID, "Enter a playlist name");
    }
    return await ctx.db.insert("playlists", {
      profileId: profile._id,
      name,
      createdAt: Date.now(),
    });
  },
});

export const getPlaylist = authedQuery({
  args: { playlistId: v.id("playlists") },
  returns: v.union(
    v.object({
      playlistId: v.id("playlists"),
      name: v.string(),
      tracks: v.array(libraryTrackValidator),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const supporter = await loadSupporterAccess(ctx, profile._id);
    const playlist = await ctx.db.get(args.playlistId);
    if (playlist === null || playlist.profileId !== profile._id) {
      return null;
    }
    const entries = await ctx.db
      .query("playlistEntries")
      .withIndex("by_playlist_position", (q) =>
        q.eq("playlistId", playlist._id)
      )
      .collect();
    const likedIds = await likedTrackIdSet(ctx, profile._id);
    const tracks = [];
    for (const entry of entries) {
      const row = await presentTrack(
        ctx,
        entry.trackId,
        profile._id,
        likedIds.has(entry.trackId),
        supporter
      );
      if (row !== null) {
        tracks.push(row);
      }
    }
    return { playlistId: playlist._id, name: playlist.name, tracks };
  },
});

export const addTrack = authedMutation({
  args: { playlistId: v.id("playlists"), trackId: v.id("tracks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const playlist = await ownedPlaylist(ctx, args.playlistId, profile._id);
    const track = await publishedTrack(ctx, args.trackId);
    const entries = await ctx.db
      .query("playlistEntries")
      .withIndex("by_playlist_position", (q) =>
        q.eq("playlistId", playlist._id)
      )
      .collect();
    if (entries.some((entry) => entry.trackId === track._id)) {
      return null;
    }
    const position = entries.reduce(
      (max, entry) => Math.max(max, entry.position),
      0
    );
    await ctx.db.insert("playlistEntries", {
      playlistId: playlist._id,
      trackId: track._id,
      position: position + 1,
      addedAt: Date.now(),
    });
    return null;
  },
});

export const deletePlaylist = authedMutation({
  args: { playlistId: v.id("playlists") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const playlist = await ownedPlaylist(ctx, args.playlistId, profile._id);
    const entries = await ctx.db
      .query("playlistEntries")
      .withIndex("by_playlist_position", (q) =>
        q.eq("playlistId", playlist._id)
      )
      .collect();
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }
    await ctx.db.delete(playlist._id);
    return null;
  },
});

export const removeTrack = authedMutation({
  args: { playlistId: v.id("playlists"), trackId: v.id("tracks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const playlist = await ownedPlaylist(ctx, args.playlistId, profile._id);
    const entries = await ctx.db
      .query("playlistEntries")
      .withIndex("by_playlist_position", (q) =>
        q.eq("playlistId", playlist._id)
      )
      .collect();
    const entry = entries.find((row) => row.trackId === args.trackId);
    if (entry !== undefined) {
      await ctx.db.delete(entry._id);
    }
    return null;
  },
});

export const listAddableTracks = authedQuery({
  args: { playlistId: v.id("playlists") },
  returns: v.array(libraryTrackValidator),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const supporter = await loadSupporterAccess(ctx, profile._id);
    const playlist = await ctx.db.get(args.playlistId);
    if (playlist === null || playlist.profileId !== profile._id) {
      return [];
    }
    const entries = await ctx.db
      .query("playlistEntries")
      .withIndex("by_playlist_position", (q) =>
        q.eq("playlistId", playlist._id)
      )
      .collect();
    const memberIds = new Set(entries.map((entry) => entry.trackId));
    const published = await ctx.db
      .query("tracks")
      .withIndex("by_visibility_publishedAt", (q) =>
        q.eq("visibility", "public")
      )
      .order("desc")
      .take(ADDABLE_LIMIT + memberIds.size);
    const likedIds = await likedTrackIdSet(ctx, profile._id);
    const tracks = [];
    for (const track of published) {
      if (memberIds.has(track._id) || tracks.length >= ADDABLE_LIMIT) {
        continue;
      }
      const row = await presentTrack(
        ctx,
        track._id,
        profile._id,
        likedIds.has(track._id),
        supporter
      );
      if (row !== null) {
        tracks.push(row);
      }
    }
    return tracks;
  },
});

async function publishedTrack(ctx: MutationCtx, trackId: Id<"tracks">) {
  const track = await ctx.db.get(trackId);
  if (track === null || track.hidden || track.state !== "published") {
    raise(ERROR_CODES.INVALID, "Track not found");
  }
  return track;
}

async function ownedPlaylist(
  ctx: MutationCtx,
  playlistId: Id<"playlists">,
  profileId: Id<"profiles">
) {
  const playlist = await ctx.db.get(playlistId);
  if (playlist === null || playlist.profileId !== profileId) {
    raise(ERROR_CODES.NOT_PERMITTED, "Playlist not found");
  }
  return playlist;
}

async function coverArtworkUrls(
  ctx: QueryCtx,
  entries: { trackId: Id<"tracks">; position: number }[]
) {
  const ordered = [...entries].sort((a, b) => a.position - b.position);
  const urls: string[] = [];
  for (const entry of ordered) {
    if (urls.length >= COVER_ART_LIMIT) {
      break;
    }
    const track = await ctx.db.get(entry.trackId);
    if (track === null || track.hidden || track.state !== "published") {
      continue;
    }
    const url = await fileUrl(ctx, track.artworkFileId);
    if (url !== null) {
      urls.push(url);
    }
  }
  return urls;
}

async function presentTrack(
  ctx: QueryCtx,
  trackId: Id<"tracks">,
  profileId: Id<"profiles">,
  liked: boolean,
  supporter: SupporterAccess
) {
  const track = await ctx.db.get(trackId);
  if (track === null || track.hidden || track.state !== "published") {
    return null;
  }
  const artist = await ctx.db.get(track.artistId);
  if (artist === null || artist.hidden) {
    return null;
  }
  const access = decideTrackAccess(
    track,
    artist.profileId === profileId,
    gateForArtist(supporter, track.artistId)
  );
  if (!access.allowed && !isLocked(access)) {
    return null;
  }
  return {
    trackId: track._id,
    artistId: artist._id,
    title: track.title,
    artistName: artist.name,
    artworkUrl: await fileUrl(ctx, track.artworkFileId),
    durationMs: track.durationMs,
    locked: isLocked(access),
    liked,
  };
}
