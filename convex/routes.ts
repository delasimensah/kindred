import {
  equalSharePercent,
  equalSplitCents,
  periodKey,
  recordedShareCents,
  TIER_CENTS,
} from "shared";
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
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
    foundingArtistIds: v.array(v.id("artists")),
  }),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const access = await loadSupporterAccess(ctx, profile._id);
    const routes = access.entitled
      ? await ctx.db
          .query("supportRoutes")
          .withIndex("by_profile_active", (q) =>
            q.eq("profileId", profile._id).eq("active", true)
          )
          .collect()
      : [];
    return {
      entitled: access.entitled,
      routedArtistIds: access.entitled ? [...access.routedArtistIds] : [],
      foundingArtistIds: routes
        .filter((route) => route.founding)
        .map((route) => route.artistId),
    };
  },
});

const impactArtist = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  founding: v.boolean(),
  inRoute: v.boolean(),
  sharePercent: v.number(),
  amountCents: v.number(),
  sinceCents: v.number(),
});

/** This month's subscription, plus what each artist has received since support started. */
export const impact = authedQuery({
  args: {},
  returns: v.object({
    entitled: v.boolean(),
    totalCents: v.number(),
    sinceCents: v.number(),
    artists: v.array(impactArtist),
  }),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const access = await loadSupporterAccess(ctx, profile._id);
    if (!access.entitled) {
      return { entitled: false, totalCents: 0, sinceCents: 0, artists: [] };
    }
    const entitlement = await ctx.db
      .query("entitlements")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile._id))
      .unique();
    const totalCents =
      entitlement === null ? 0 : TIER_CENTS[entitlement.priceTier];
    const currentPeriod = periodKey();
    const earnings = await ctx.db
      .query("demoEarnings")
      .withIndex("by_profile_period", (q) => q.eq("profileId", profile._id))
      .collect();
    const pastByArtist = new Map<Id<"artists">, number>();
    for (const row of earnings) {
      if (row.period === currentPeriod) {
        continue;
      }
      const slice = recordedShareCents(row.tierCents, row.routedCount);
      pastByArtist.set(
        row.artistId,
        (pastByArtist.get(row.artistId) ?? 0) + slice
      );
    }
    const activeRoutes = await ctx.db
      .query("supportRoutes")
      .withIndex("by_profile_active", (q) =>
        q.eq("profileId", profile._id).eq("active", true)
      )
      .collect();
    const inactiveRoutes = await ctx.db
      .query("supportRoutes")
      .withIndex("by_profile_active", (q) =>
        q.eq("profileId", profile._id).eq("active", false)
      )
      .collect();
    const routeByArtist = new Map(
      [...inactiveRoutes, ...activeRoutes].map((route) => [
        route.artistId,
        route,
      ])
    );
    activeRoutes.sort((a, b) => a.startedAt - b.startedAt);
    const activeArtists = [];
    for (const route of activeRoutes) {
      const artist = await ctx.db.get(route.artistId);
      if (artist === null || artist.hidden) {
        continue;
      }
      activeArtists.push(artist);
    }
    const amounts = equalSplitCents(totalCents, activeArtists.length);
    const sharePercent = equalSharePercent(activeArtists.length);
    const monthByArtist = new Map(
      activeArtists.map((artist, index) => [artist._id, amounts[index] ?? 0])
    );
    const artistIds = [
      ...activeArtists.map((artist) => artist._id),
      ...[...pastByArtist.keys()].filter(
        (artistId) => !monthByArtist.has(artistId)
      ),
    ];
    const artists = [];
    for (const artistId of artistIds) {
      const loaded = await ctx.db.get(artistId);
      if (loaded === null || loaded.hidden) {
        continue;
      }
      const inRoute = monthByArtist.has(artistId);
      const amountCents = monthByArtist.get(artistId) ?? 0;
      const sinceCents = (pastByArtist.get(artistId) ?? 0) + amountCents;
      const route = routeByArtist.get(artistId);
      artists.push({
        artistId: loaded._id,
        name: loaded.name,
        avatarUrl: await fileUrl(ctx, loaded.avatarFileId),
        founding: route?.founding === true,
        inRoute,
        sharePercent: inRoute ? sharePercent : 0,
        amountCents,
        sinceCents,
      });
    }
    const sinceCents = artists.reduce(
      (sum, artist) => sum + artist.sinceCents,
      0
    );
    return { entitled: true, totalCents, sinceCents, artists };
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
