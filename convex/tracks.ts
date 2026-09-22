import { v } from "convex/values";

import { requireProfile } from "./lib/auth";
import { authedQuery } from "./lib/functions";

const publishedTrackValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  durationMs: v.number(),
  visibility: v.union(v.literal("public"), v.literal("supporters")),
  genre: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
});

export const listPublishedForArtist = authedQuery({
  args: { artistId: v.id("artists") },
  returns: v.array(publishedTrackValidator),
  handler: async (ctx, args) => {
    await requireProfile(ctx);
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", args.artistId).eq("state", "published")
      )
      .order("desc")
      .collect();
    const rows = [];
    for (const track of tracks) {
      if (track.hidden) {
        continue;
      }
      let artworkUrl: string | null = null;
      if (track.artworkFileId !== undefined) {
        const file = await ctx.db.get(track.artworkFileId);
        if (file !== null) {
          artworkUrl = await ctx.storage.getUrl(file.storageId);
        }
      }
      rows.push({
        trackId: track._id,
        title: track.title,
        durationMs: track.durationMs,
        visibility: track.visibility,
        genre: track.genre,
        artworkUrl,
      });
    }
    return rows;
  },
});
