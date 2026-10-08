import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { FOUNDING_SUPPORTER_LIMIT } from "shared";

import { requireProfile, requireVerifiedArtist } from "./lib/auth";
import { fileUrl } from "./lib/files";
import { getFollow } from "./lib/follows";
import { authedQuery } from "./lib/functions";
import { presenceCutoff } from "./lib/presence";

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

const artistProfileValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  bio: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  coverUrl: v.union(v.string(), v.null()),
  isFollowed: v.boolean(),
  followerCount: v.number(),
  supporterCount: v.number(),
  /** Approximate live listeners; number only, never identities. */
  liveListenerCount: v.number(),
});

export const get = authedQuery({
  args: { artistId: v.id("artists") },
  returns: v.union(artistProfileValidator, v.null()),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null || artist.hidden) {
      return null;
    }
    const follow = await getFollow(ctx, profile._id, artist._id);
    const cutoff = presenceCutoff();
    const live = await ctx.db
      .query("presenceHeartbeats")
      .withIndex("by_artist_lastBeatAt", (q) =>
        q.eq("artistId", artist._id).gt("lastBeatAt", cutoff)
      )
      .collect();
    const stats = await ctx.db
      .query("artistStats")
      .withIndex("by_artistId", (q) => q.eq("artistId", artist._id))
      .unique();
    return {
      artistId: artist._id,
      name: artist.name,
      bio: artist.bio,
      avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      coverUrl: await fileUrl(ctx, artist.coverFileId),
      isFollowed: follow !== null,
      followerCount: stats?.followerCount ?? 0,
      supporterCount: stats?.supporterCount ?? 0,
      liveListenerCount: live.length,
    };
  },
});

const supporterRowValidator = v.object({
  profileId: v.id("profiles"),
  displayName: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  startedAt: v.number(),
  founding: v.boolean(),
});

/**
 * Counts for the supporters header. The total is the stored artist stat.
 * Founding is at most the first 10, read with a bounded index query.
 */
export const supporterSummary = authedQuery({
  args: {},
  returns: v.object({
    total: v.number(),
    foundingCount: v.number(),
  }),
  handler: async (ctx) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const stats = await ctx.db
      .query("artistStats")
      .withIndex("by_artistId", (q) => q.eq("artistId", artist._id))
      .unique();
    const founding = await ctx.db
      .query("supportRoutes")
      .withIndex("by_artist_active_founding", (q) =>
        q.eq("artistId", artist._id).eq("active", true).eq("founding", true)
      )
      .take(FOUNDING_SUPPORTER_LIMIT);
    return {
      total: stats?.supporterCount ?? 0,
      foundingCount: founding.length,
    };
  },
});

/** One page of supporters, earliest route first. */
export const listSupporters = authedQuery({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(supporterRowValidator),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const result = await ctx.db
      .query("supportRoutes")
      .withIndex("by_artist_active_startedAt", (q) =>
        q.eq("artistId", artist._id).eq("active", true)
      )
      .order("asc")
      .paginate(args.paginationOpts);

    const page = [];
    for (const route of result.page) {
      const fan = await ctx.db.get(route.profileId);
      if (fan === null) {
        continue;
      }
      page.push({
        profileId: fan._id,
        displayName: fan.displayName,
        avatarUrl: await fileUrl(ctx, fan.avatarFileId),
        startedAt: route.startedAt,
        founding: route.founding,
      });
    }

    return {
      ...result,
      page,
    };
  },
});
