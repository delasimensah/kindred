import { v } from "convex/values";

import { requireProfile } from "./lib/auth";
import { authedQuery } from "./lib/functions";

const onboardingArtistValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  handle: v.string(),
  bio: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  isFollowed: v.boolean(),
});

export const listForOnboarding = authedQuery({
  args: {},
  returns: v.array(onboardingArtistValidator),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const artists = await ctx.db
      .query("artists")
      .withIndex("by_hidden_createdAt", (q) => q.eq("hidden", false))
      .collect();
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .collect();
    const followed = new Set(follows.map((row) => row.artistId));
    const selected = new Set(profile.genres);
    const rows = [];
    for (const artist of artists) {
      let avatarUrl: string | null = null;
      if (artist.avatarFileId !== undefined) {
        const file = await ctx.db.get(artist.avatarFileId);
        if (file !== null) {
          avatarUrl = await ctx.storage.getUrl(file.storageId);
        }
      }
      rows.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        bio: artist.bio,
        avatarUrl,
        isFollowed: followed.has(artist._id),
        matchesGenre: [...selected].some((genre) =>
          artist.bio.startsWith(genre)
        ),
      });
    }
    rows.sort((left, right) => {
      if (left.matchesGenre !== right.matchesGenre) {
        return left.matchesGenre ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });
    return rows.map((row) => ({
      artistId: row.artistId,
      name: row.name,
      handle: row.handle,
      bio: row.bio,
      avatarUrl: row.avatarUrl,
      isFollowed: row.isFollowed,
    }));
  },
});
