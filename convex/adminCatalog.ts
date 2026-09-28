import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { authedQuery } from "./lib/functions";

const ARTIST_MATCH_CAP = 8;
const SCHEDULED_CAP = 20;

const artistRowValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  handle: v.string(),
  hidden: v.boolean(),
  avatarUrl: v.union(v.string(), v.null()),
});

const trackRowValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  artistId: v.id("artists"),
  artistName: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  visibility: v.union(v.literal("public"), v.literal("supporters")),
  state: v.union(v.literal("scheduled"), v.literal("published")),
  hidden: v.boolean(),
});

const releaseRowValidator = v.object({
  releaseId: v.id("releases"),
  title: v.string(),
  type: v.union(v.literal("ep"), v.literal("album")),
  visibility: v.union(v.literal("public"), v.literal("supporters")),
  state: v.union(v.literal("scheduled"), v.literal("published")),
  hidden: v.boolean(),
  tracks: v.array(trackRowValidator),
});

async function trackRow(
  ctx: QueryCtx,
  track: Doc<"tracks">,
  artistName: string
) {
  if (track.state !== "published" && track.state !== "scheduled") {
    return null;
  }
  return {
    trackId: track._id,
    title: track.title,
    artistId: track.artistId,
    artistName,
    artworkUrl: await fileUrl(ctx, track.artworkFileId),
    visibility: track.visibility,
    state: track.state,
    hidden: track.hidden,
  };
}

async function artistName(
  ctx: QueryCtx,
  artistId: Id<"artists">,
  cache: Map<string, string>
): Promise<string> {
  const cached = cache.get(artistId);
  if (cached !== undefined) {
    return cached;
  }
  const artist = await ctx.db.get(artistId);
  const name = artist?.name ?? "Unknown artist";
  cache.set(artistId, name);
  return name;
}

export const listArtists = authedQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("artists")
      .withIndex("by_artistName")
      .order("asc")
      .paginate(args.paginationOpts);
    const page = [];
    for (const artist of result.page) {
      page.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        hidden: artist.hidden,
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      });
    }
    return { ...result, page };
  },
});

export const searchArtists = authedQuery({
  args: { term: v.string() },
  returns: v.array(artistRowValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const term = args.term.trim();
    if (term.length === 0) {
      return [];
    }
    const matches = await ctx.db
      .query("artists")
      .withSearchIndex("by_name", (q) => q.search("name", term))
      .take(ARTIST_MATCH_CAP);
    const rows = [];
    for (const artist of matches) {
      rows.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        hidden: artist.hidden,
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      });
    }
    return rows;
  },
});

export const searchTracks = authedQuery({
  args: { term: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const term = args.term.trim();
    if (term.length === 0) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }
    const result = await ctx.db
      .query("tracks")
      .withSearchIndex("by_title", (q) => q.search("title", term))
      .paginate(args.paginationOpts);
    const names = new Map<string, string>();
    const page = [];
    for (const track of result.page) {
      const row = await trackRow(
        ctx,
        track,
        await artistName(ctx, track.artistId, names)
      );
      if (row !== null) {
        page.push(row);
      }
    }
    return { ...result, page };
  },
});

export const listHiddenTracks = authedQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("tracks")
      .withIndex("by_hidden_createdAt", (q) => q.eq("hidden", true))
      .order("desc")
      .paginate(args.paginationOpts);
    const names = new Map<string, string>();
    const page = [];
    for (const track of result.page) {
      const row = await trackRow(
        ctx,
        track,
        await artistName(ctx, track.artistId, names)
      );
      if (row !== null) {
        page.push(row);
      }
    }
    return { ...result, page };
  },
});

export const listScheduledTracks = authedQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const result = await ctx.db
      .query("tracks")
      .withIndex("by_state_publishAt", (q) => q.eq("state", "scheduled"))
      .order("desc")
      .paginate(args.paginationOpts);
    const names = new Map<string, string>();
    const page = [];
    for (const track of result.page) {
      const row = await trackRow(
        ctx,
        track,
        await artistName(ctx, track.artistId, names)
      );
      if (row !== null) {
        page.push(row);
      }
    }
    return { ...result, page };
  },
});

export const getArtist = authedQuery({
  args: { artistId: v.id("artists") },
  returns: v.union(artistRowValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null) {
      return null;
    }
    return {
      artistId: artist._id,
      name: artist.name,
      handle: artist.handle,
      hidden: artist.hidden,
      avatarUrl: await fileUrl(ctx, artist.avatarFileId),
    };
  },
});

async function releaseRow(ctx: QueryCtx, release: Doc<"releases">) {
  if (release.state !== "published" && release.state !== "scheduled") {
    return null;
  }
  const artist = await ctx.db.get(release.artistId);
  const members = await ctx.db
    .query("tracks")
    .withIndex("by_release_position", (q) => q.eq("releaseId", release._id))
    .collect();
  members.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const tracks = [];
  for (const track of members) {
    const row = await trackRow(ctx, track, artist?.name ?? "Unknown artist");
    if (row !== null) {
      tracks.push(row);
    }
  }
  return {
    releaseId: release._id,
    title: release.title,
    type: release.type,
    visibility: release.visibility,
    state: release.state,
    hidden: release.hidden,
    tracks,
  };
}

export const listReleases = authedQuery({
  args: {
    artistId: v.id("artists"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null) {
      raise(ERROR_CODES.INVALID, "Artist not found");
    }
    const result = await ctx.db
      .query("releases")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", args.artistId).eq("state", "published")
      )
      .order("desc")
      .paginate(args.paginationOpts);
    const page = [];
    for (const release of result.page) {
      const row = await releaseRow(ctx, release);
      if (row !== null) {
        page.push(row);
      }
    }
    return { ...result, page };
  },
});

export const listSingles = authedQuery({
  args: {
    artistId: v.id("artists"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null) {
      raise(ERROR_CODES.INVALID, "Artist not found");
    }
    const result = await ctx.db
      .query("tracks")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", args.artistId).eq("state", "published")
      )
      .order("desc")
      .paginate(args.paginationOpts);
    const page = [];
    for (const track of result.page) {
      if (track.releaseId !== undefined) {
        continue;
      }
      const row = await trackRow(ctx, track, artist.name);
      if (row !== null) {
        page.push(row);
      }
    }
    return { ...result, page };
  },
});

export const listScheduledForArtist = authedQuery({
  args: { artistId: v.id("artists") },
  returns: v.object({
    releases: v.array(releaseRowValidator),
    singles: v.array(trackRowValidator),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null) {
      raise(ERROR_CODES.INVALID, "Artist not found");
    }
    const releases = await ctx.db
      .query("releases")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", args.artistId).eq("state", "scheduled")
      )
      .order("desc")
      .take(SCHEDULED_CAP + 1);
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", args.artistId).eq("state", "scheduled")
      )
      .order("desc")
      .take(SCHEDULED_CAP + 1);
    const releaseRows = [];
    for (const release of releases.slice(0, SCHEDULED_CAP)) {
      const row = await releaseRow(ctx, release);
      if (row !== null) {
        releaseRows.push(row);
      }
    }
    const singles = [];
    for (const track of tracks) {
      if (track.releaseId !== undefined || singles.length >= SCHEDULED_CAP) {
        continue;
      }
      const row = await trackRow(ctx, track, artist.name);
      if (row !== null) {
        singles.push(row);
      }
    }
    return {
      releases: releaseRows,
      singles,
      hasMore: releases.length > SCHEDULED_CAP || tracks.length > SCHEDULED_CAP,
    };
  },
});
