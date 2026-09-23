import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { requireProfile } from "./lib/auth";
import { authedQuery } from "./lib/functions";

const discoverArtistValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  handle: v.string(),
  bio: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  coverUrl: v.union(v.string(), v.null()),
  isFollowed: v.boolean(),
});

async function resolveImageUrl(
  ctx: QueryCtx,
  fileId: Id<"files"> | undefined
): Promise<string | null> {
  if (fileId === undefined) {
    return null;
  }
  const file = await ctx.db.get(fileId);
  if (file === null) {
    return null;
  }
  return await ctx.storage.getUrl(file.storageId);
}

/**
 * Featured slots first, then rising artists by score.
 * Featured artists are not repeated in Rising.
 * https://docs.convex.dev/database/reading-data
 */
export const listForDiscover = authedQuery({
  args: {},
  returns: v.object({
    featured: v.array(discoverArtistValidator),
    rising: v.array(discoverArtistValidator),
  }),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const now = Date.now();
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .collect();
    const followed = new Set(follows.map((row) => row.artistId));
    const selectedGenres = new Set(profile.genres);

    const slots = await ctx.db
      .query("featuredSlots")
      .withIndex("by_position")
      .collect();
    const activeSlots = slots
      .filter(
        (slot) =>
          slot.targetType === "artist" &&
          slot.artistId !== undefined &&
          slot.activeFrom <= now &&
          (slot.activeTo === undefined || slot.activeTo > now)
      )
      .sort((left, right) => left.position - right.position);

    const featuredIds = new Set<Id<"artists">>();
    const featured = [];
    for (const slot of activeSlots) {
      const artistId = slot.artistId;
      if (artistId === undefined || featuredIds.has(artistId)) {
        continue;
      }
      const artist = await ctx.db.get(artistId);
      if (artist === null || artist.hidden) {
        continue;
      }
      featuredIds.add(artistId);
      featured.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        bio: artist.bio,
        avatarUrl: await resolveImageUrl(ctx, artist.avatarFileId),
        coverUrl: await resolveImageUrl(ctx, artist.coverFileId),
        isFollowed: followed.has(artist._id),
      });
    }

    const stats = await ctx.db
      .query("artistStats")
      .withIndex("by_risingScore")
      .order("desc")
      .take(40);

    const risingCandidates = [];
    for (const row of stats) {
      if (featuredIds.has(row.artistId)) {
        continue;
      }
      const artist = await ctx.db.get(row.artistId);
      if (artist === null || artist.hidden) {
        continue;
      }
      const matchesGenre = [...selectedGenres].some((genre) =>
        artist.bio.includes(genre)
      );
      risingCandidates.push({
        artist,
        risingScore: row.risingScore,
        matchesGenre,
      });
    }
    risingCandidates.sort((left, right) => {
      if (left.matchesGenre !== right.matchesGenre) {
        return left.matchesGenre ? -1 : 1;
      }
      if (left.risingScore !== right.risingScore) {
        return right.risingScore - left.risingScore;
      }
      return left.artist.name.localeCompare(right.artist.name);
    });

    const rising = [];
    for (const candidate of risingCandidates.slice(0, 20)) {
      const artist = candidate.artist;
      rising.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        bio: artist.bio,
        avatarUrl: await resolveImageUrl(ctx, artist.avatarFileId),
        coverUrl: await resolveImageUrl(ctx, artist.coverFileId),
        isFollowed: followed.has(artist._id),
      });
    }

    return { featured, rising };
  },
});
