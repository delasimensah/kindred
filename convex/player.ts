import { v } from "convex/values";

import { decideTrackAccess } from "./lib/access";
import { requireProfile } from "./lib/auth";
import { authedQuery } from "./lib/functions";

const MAX_IDS = 100;

/** Which queued tracks this listener may play. No audio addresses. */
export const resolveQueueAccess = authedQuery({
  args: { trackIds: v.array(v.id("tracks")) },
  returns: v.array(
    v.object({
      trackId: v.id("tracks"),
      playable: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const rows = [];
    for (const trackId of args.trackIds.slice(0, MAX_IDS)) {
      const track = await ctx.db.get(trackId);
      if (track === null) {
        rows.push({ trackId, playable: false });
        continue;
      }
      const artist = await ctx.db.get(track.artistId);
      const isOwner =
        artist !== null && artist.profileId === profile._id && !artist.hidden;
      rows.push({
        trackId,
        playable:
          artist !== null &&
          !artist.hidden &&
          decideTrackAccess(track, isOwner).allowed,
      });
    }
    return rows;
  },
});
