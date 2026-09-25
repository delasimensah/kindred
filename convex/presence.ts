import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { decideTrackAccess } from "./lib/access";
import { requireProfile } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedMutation, authedQuery } from "./lib/functions";
import { presenceCleanupCutoff, presenceCutoff } from "./lib/presence";

/**
 * Upsert this listener's single presence row while audio is playing.
 * Not called while paused. One row per profile, patched in place.
 */
export const heartbeat = authedMutation({
  args: {
    artistId: v.id("artists"),
    trackId: v.id("tracks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const track = await ctx.db.get(args.trackId);
    const artist = track === null ? null : await ctx.db.get(track.artistId);
    if (track === null || artist === null || track.artistId !== args.artistId) {
      raise(ERROR_CODES.INVALID);
    }
    const access = decideTrackAccess(track, artist.profileId === profile._id);
    if (!access.allowed) {
      raise(ERROR_CODES.NOT_PERMITTED);
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("presenceHeartbeats")
      .withIndex("by_profileId", (q) => q.eq("profileId", profile._id))
      .unique();
    if (existing === null) {
      await ctx.db.insert("presenceHeartbeats", {
        profileId: profile._id,
        artistId: artist._id,
        trackId: track._id,
        lastBeatAt: now,
      });
      return null;
    }
    await ctx.db.patch(existing._id, {
      artistId: artist._id,
      trackId: track._id,
      lastBeatAt: now,
    });
    return null;
  },
});

/**
 * Approximate live listeners on this artist's tracks (last beat within 60s).
 * Number only — never identities.
 */
export const countForArtist = authedQuery({
  args: { artistId: v.id("artists") },
  returns: v.number(),
  handler: async (ctx, args) => {
    await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null || artist.hidden) {
      return 0;
    }
    const cutoff = presenceCutoff();
    const rows = await ctx.db
      .query("presenceHeartbeats")
      .withIndex("by_artist_lastBeatAt", (q) =>
        q.eq("artistId", args.artistId).gt("lastBeatAt", cutoff)
      )
      .collect();
    return rows.length;
  },
});

/** Delete heartbeat rows older than 10 minutes. Cron every 10 minutes. */
export const cleanup = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cutoff = presenceCleanupCutoff();
    const stale = await ctx.db
      .query("presenceHeartbeats")
      .withIndex("by_lastBeatAt", (q) => q.lt("lastBeatAt", cutoff))
      .collect();
    for (const row of stale) {
      await ctx.db.delete(row._id);
    }
    return stale.length;
  },
});
