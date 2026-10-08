import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { fileUrl } from "./lib/files";
import { GENRES, hasUnknownGenre } from "./lib/genres";

const TILE_SCAN = 12;
const TRACK_CAP = 20;
const ARTIST_CAP = 12;

const artistValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
});

const trackValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  artistId: v.id("artists"),
  artistName: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
});

function isPublicTrack(track: Doc<"tracks">) {
  return (
    track.state === "published" &&
    !track.hidden &&
    track.visibility === "public"
  );
}

async function listedArtist(ctx: QueryCtx, artistId: Id<"artists">) {
  const artist = await ctx.db.get(artistId);
  if (artist === null || artist.hidden) {
    return null;
  }
  return artist;
}

/** One cover per genre that has a public track, in the genre list order. */
export const tiles = query({
  args: {},
  returns: v.array(
    v.object({
      genre: v.string(),
      artworkUrl: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx) => {
    const tiles = [];
    for (const genre of GENRES) {
      const rows = await ctx.db
        .query("tracks")
        .withIndex("by_genre_publishedAt", (q) => q.eq("genre", genre))
        .order("desc")
        .take(TILE_SCAN);
      const track = rows.find(isPublicTrack);
      if (track === undefined) {
        continue;
      }
      if ((await listedArtist(ctx, track.artistId)) === null) {
        continue;
      }
      tiles.push({
        genre,
        artworkUrl: await fileUrl(ctx, track.artworkFileId),
      });
    }
    return tiles;
  },
});

/** Artists and newest public tracks for one genre. */
export const page = query({
  args: { genre: v.string() },
  returns: v.union(
    v.object({
      genre: v.string(),
      artists: v.array(artistValidator),
      tracks: v.array(trackValidator),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    if (hasUnknownGenre([args.genre])) {
      return null;
    }
    const rows = await ctx.db
      .query("tracks")
      .withIndex("by_genre_publishedAt", (q) => q.eq("genre", args.genre))
      .order("desc")
      .take(80);
    const artists = [];
    const tracks = [];
    const seen = new Set<string>();
    for (const track of rows) {
      if (!isPublicTrack(track)) {
        continue;
      }
      const artist = await listedArtist(ctx, track.artistId);
      if (artist === null) {
        continue;
      }
      if (!seen.has(artist._id) && artists.length < ARTIST_CAP) {
        seen.add(artist._id);
        artists.push({
          artistId: artist._id,
          name: artist.name,
          avatarUrl: await fileUrl(ctx, artist.avatarFileId),
        });
      }
      if (tracks.length < TRACK_CAP) {
        tracks.push({
          trackId: track._id,
          title: track.title,
          artistId: artist._id,
          artistName: artist.name,
          artworkUrl: await fileUrl(ctx, track.artworkFileId),
          durationMs: track.durationMs,
        });
      }
    }
    return { genre: args.genre, artists, tracks };
  },
});
