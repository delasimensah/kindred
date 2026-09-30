import { v } from "convex/values";

import { decideTrackAccess, isLocked } from "./lib/access";
import { gateForArtist, loadSupporterAccess } from "./lib/supporterAccess";
import { requireProfile } from "./lib/auth";
import { fileUrl } from "./lib/files";
import { authedQuery } from "./lib/functions";
import { likedTrackIdSet } from "./lib/library";

/**
 * Exact name search for this version.
 * Meaning-based results are not in this version (29 Sep 2026).
 * Keep the minimum length in step with the phone debounce in `useDebouncedSearchTerm`.
 */
const MIN_TERM_LENGTH = 2;
const MAX_TERM_LENGTH = 80;
const ARTIST_CAP = 8;
const TRACK_CAP = 20;

const artistResult = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  detail: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  isFollowed: v.boolean(),
});

const trackResult = v.object({
  trackId: v.id("tracks"),
  artistId: v.id("artists"),
  title: v.string(),
  artistName: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
  locked: v.boolean(),
  liked: v.boolean(),
});

/**
 * A name search only. One or two letters, or a string with no letters or
 * numbers, returns nothing so the search indexes stay idle.
 */
export function normalizeExactSearchTerm(raw: string): string | null {
  const term = raw.trim().replace(/\s+/g, " ").slice(0, MAX_TERM_LENGTH);
  if (
    term.length < MIN_TERM_LENGTH ||
    !/[0-9A-Za-z\u00C0-\u024F]/u.test(term)
  ) {
    return null;
  }
  return term;
}

function artistDetail(bio: string): string {
  const genre = bio.split(" · ")[0]?.trim() ?? "";
  return genre.length > 0 ? `Artist · ${genre}` : "Artist";
}

export const exact = authedQuery({
  args: { term: v.string() },
  returns: v.object({
    artists: v.array(artistResult),
    tracks: v.array(trackResult),
  }),
  handler: async (ctx, args) => {
    const term = normalizeExactSearchTerm(args.term);
    if (term === null) {
      return { artists: [], tracks: [] };
    }
    const { profile } = await requireProfile(ctx);
    const supporter = await loadSupporterAccess(ctx, profile._id);
    const artistMatches = await ctx.db
      .query("artists")
      .withSearchIndex("by_name", (q) =>
        q.search("name", term).eq("hidden", false)
      )
      .take(ARTIST_CAP);
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .collect();
    const followed = new Set(follows.map((row) => row.artistId));
    const artists = [];
    for (const artist of artistMatches) {
      if (artist.hidden) {
        continue;
      }
      artists.push({
        artistId: artist._id,
        name: artist.name,
        detail: artistDetail(artist.bio),
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
        isFollowed: followed.has(artist._id),
      });
    }

    const trackMatches = await ctx.db
      .query("tracks")
      .withSearchIndex("by_title", (q) =>
        q.search("title", term).eq("state", "published").eq("hidden", false)
      )
      .take(TRACK_CAP);
    const likedIds = await likedTrackIdSet(ctx, profile._id);
    const tracks = [];
    for (const track of trackMatches) {
      if (track.hidden || track.state !== "published") {
        continue;
      }
      const artist = await ctx.db.get(track.artistId);
      if (artist === null || artist.hidden) {
        continue;
      }
      tracks.push({
        trackId: track._id,
        artistId: artist._id,
        title: track.title,
        artistName: artist.name,
        artworkUrl: await fileUrl(ctx, track.artworkFileId),
        durationMs: track.durationMs,
        locked: isLocked(
          decideTrackAccess(
            track,
            artist.profileId === profile._id,
            gateForArtist(supporter, track.artistId)
          )
        ),
        liked: likedIds.has(track._id),
      });
    }
    return { artists, tracks };
  },
});
