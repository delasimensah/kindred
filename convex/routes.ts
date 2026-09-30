import { v } from "convex/values";

import { bumpSupporterCount } from "./lib/artistStats";
import { requireProfile } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { getFollow } from "./lib/follows";
import { authedMutation, authedQuery } from "./lib/functions";
import { hasActiveSupportRoute } from "./lib/routes";
import {
  isFoundingSlot,
  loadSupporterAccess,
  routesEverStarted,
} from "./lib/supporterAccess";

const MAX_ROUTES = 5;

const artistCard = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
});

export const summary = authedQuery({
  args: {},
  returns: v.object({
    entitled: v.boolean(),
    routedArtistIds: v.array(v.id("artists")),
  }),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const access = await loadSupporterAccess(ctx, profile._id);
    return {
      entitled: access.entitled,
      routedArtistIds: access.entitled ? [...access.routedArtistIds] : [],
    };
  },
});

export const picker = authedQuery({
  args: { startingArtistId: v.optional(v.id("artists")) },
  returns: v.object({
    entitled: v.boolean(),
    artists: v.array(artistCard),
    routedArtistIds: v.array(v.id("artists")),
    startingArtist: v.union(
      v.null(),
      v.object({
        artistId: v.id("artists"),
        name: v.string(),
        avatarUrl: v.union(v.string(), v.null()),
        followed: v.boolean(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const access = await loadSupporterAccess(ctx, profile._id);
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .collect();
    const artists = [];
    for (const follow of follows) {
      const artist = await ctx.db.get(follow.artistId);
      if (artist === null || artist.hidden) {
        continue;
      }
      artists.push({
        artistId: artist._id,
        name: artist.name,
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      });
    }
    let startingArtist = null;
    if (args.startingArtistId !== undefined) {
      const artist = await ctx.db.get(args.startingArtistId);
      if (artist !== null && !artist.hidden) {
        startingArtist = {
          artistId: artist._id,
          name: artist.name,
          avatarUrl: await fileUrl(ctx, artist.avatarFileId),
          followed: await getFollow(ctx, profile._id, artist._id).then(
            (row) => row !== null
          ),
        };
      }
    }
    return {
      entitled: access.entitled,
      artists,
      routedArtistIds: [...access.routedArtistIds],
      startingArtist,
    };
  },
});

export const setRouteSet = authedMutation({
  args: {
    artistIds: v.array(v.id("artists")),
    startingArtistId: v.optional(v.id("artists")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const access = await loadSupporterAccess(ctx, profile._id);
    if (!access.entitled) {
      raise(
        ERROR_CODES.NOT_PERMITTED,
        "Your subscription is not active, so this route was not saved."
      );
    }
    const unique = [...new Set(args.artistIds)];
    if (unique.length < 1 || unique.length > MAX_ROUTES) {
      raise(ERROR_CODES.INVALID, "Pick 1 to 5 artists.");
    }
    if (
      args.startingArtistId !== undefined &&
      !unique.includes(args.startingArtistId)
    ) {
      raise(
        ERROR_CODES.INVALID,
        "This save must include the artist you opened support from."
      );
    }
    for (const artistId of unique) {
      const artist = await ctx.db.get(artistId);
      if (artist === null || artist.hidden) {
        raise(ERROR_CODES.INVALID, "Artist not found");
      }
      const follow = await getFollow(ctx, profile._id, artistId);
      if (follow === null) {
        raise(ERROR_CODES.INVALID, "Follow this artist before routing them.");
      }
    }
    const now = Date.now();
    const wanted = new Set(unique);
    const current = await ctx.db
      .query("supportRoutes")
      .withIndex("by_profile_active", (q) =>
        q.eq("profileId", profile._id).eq("active", true)
      )
      .collect();
    for (const route of current) {
      if (wanted.has(route.artistId)) {
        continue;
      }
      await ctx.db.patch(route._id, {
        active: false,
        paused: false,
        endedAt: now,
      });
      await bumpSupporterCount(ctx, route.artistId, -1);
    }
    for (const artistId of unique) {
      if (await hasActiveSupportRoute(ctx, profile._id, artistId)) {
        continue;
      }
      const existing = await ctx.db
        .query("supportRoutes")
        .withIndex("by_profile_artist", (q) =>
          q.eq("profileId", profile._id).eq("artistId", artistId)
        )
        .collect();
      const inactive = existing.find((route) => !route.active);
      if (inactive !== undefined) {
        await ctx.db.patch(inactive._id, {
          active: true,
          paused: false,
          endedAt: undefined,
        });
      } else {
        const ever = await routesEverStarted(ctx, artistId);
        await ctx.db.insert("supportRoutes", {
          profileId: profile._id,
          artistId,
          active: true,
          startedAt: now,
          founding: isFoundingSlot(ever),
        });
      }
      await bumpSupporterCount(ctx, artistId, 1);
    }
    return null;
  },
});
