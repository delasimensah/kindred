import { v } from "convex/values";

import { decideTrackAccess } from "./lib/access";
import { requireProfile } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedMutation } from "./lib/functions";

const source = v.union(
  v.literal("feed"),
  v.literal("artist"),
  v.literal("playlist"),
  v.literal("library"),
  v.literal("mix"),
  v.literal("search"),
  v.literal("offline")
);

/**
 * One row per play, for the signed-in listener only.
 * The same clientEventId is ignored, so a retry does not count twice.
 * There is no query that lists another person's listens.
 */
export const record = authedMutation({
  args: {
    trackId: v.id("tracks"),
    artistId: v.id("artists"),
    startedAt: v.number(),
    msPlayed: v.number(),
    completed: v.boolean(),
    source,
    clientEventId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    if (args.clientEventId.length === 0 || args.msPlayed < 0) {
      raise(ERROR_CODES.INVALID);
    }
    const existing = await ctx.db
      .query("listenEvents")
      .withIndex("by_profile_clientEventId", (q) =>
        q.eq("profileId", profile._id).eq("clientEventId", args.clientEventId)
      )
      .unique();
    if (existing !== null) {
      return null;
    }
    const track = await ctx.db.get(args.trackId);
    const artist = track === null ? null : await ctx.db.get(track.artistId);
    if (track === null || artist === null || track.artistId !== args.artistId) {
      raise(ERROR_CODES.INVALID);
    }
    const access = decideTrackAccess(track, artist.profileId === profile._id);
    if (!access.allowed) {
      raise(ERROR_CODES.NOT_PERMITTED);
    }
    await ctx.db.insert("listenEvents", {
      profileId: profile._id,
      trackId: track._id,
      artistId: artist._id,
      startedAt: args.startedAt,
      msPlayed: args.msPlayed,
      completed: args.completed,
      source: args.source,
      clientEventId: args.clientEventId,
    });
    return null;
  },
});
