import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import {
  handleBaseFromDisplayName,
  handleWithSuffix,
} from "./lib/artistRequestHandle";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { authedMutation, authedQuery } from "./lib/functions";

const requestRowValidator = v.object({
  requestId: v.id("artistRequests"),
  displayName: v.string(),
  handle: v.string(),
  bio: v.string(),
  note: v.string(),
  email: v.string(),
  createdAt: v.number(),
});

const queueValidator = v.object({
  pending: v.array(requestRowValidator),
  pendingCount: v.number(),
  approvedThisMonth: v.number(),
  declinedThisMonth: v.number(),
});

const artistRowValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  handle: v.string(),
  verified: v.boolean(),
  supporterCount: v.number(),
  createdAt: v.number(),
  avatarUrl: v.union(v.string(), v.null()),
});

type ReadCtx = QueryCtx | MutationCtx;

function startOfUtcMonth(now: number): number {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

async function emailForProfile(
  ctx: ReadCtx,
  profileId: Id<"profiles">
): Promise<string> {
  const profile = await ctx.db.get(profileId);
  if (profile === null) {
    return "";
  }
  const user = await ctx.db.get(profile.authUserId);
  if (user !== null && typeof user.email === "string") {
    return user.email;
  }
  return "";
}

async function handleTakenByOther(
  ctx: MutationCtx,
  handle: string,
  exceptArtistId: Id<"artists"> | null
): Promise<boolean> {
  const artist = await ctx.db
    .query("artists")
    .withIndex("by_handle", (q) => q.eq("handle", handle))
    .unique();
  if (artist === null) {
    return false;
  }
  return exceptArtistId === null || artist._id !== exceptArtistId;
}

async function allocateHandle(
  ctx: MutationCtx,
  preferred: string,
  exceptArtistId: Id<"artists"> | null
): Promise<string> {
  const base = handleBaseFromDisplayName(preferred);
  for (let suffix = 1; suffix <= 50; suffix += 1) {
    const handle = suffix === 1 ? base : handleWithSuffix(base, suffix);
    if (!(await handleTakenByOther(ctx, handle, exceptArtistId))) {
      return handle;
    }
  }
  raise(ERROR_CODES.INVALID, "Choose a different display name");
}

async function ensureArtistStats(
  ctx: MutationCtx,
  artistId: Id<"artists">
): Promise<void> {
  const existing = await ctx.db
    .query("artistStats")
    .withIndex("by_artistId", (q) => q.eq("artistId", artistId))
    .unique();
  if (existing !== null) {
    return;
  }
  const now = Date.now();
  await ctx.db.insert("artistStats", {
    artistId,
    followerCount: 0,
    supporterCount: 0,
    followers7d: 0,
    distinctListeners7d: 0,
    plays7d: 0,
    risingScore: 0,
    updatedAt: now,
  });
}

export const pendingCount = authedQuery({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const pending = await ctx.db
      .query("artistRequests")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

export const queue = authedQuery({
  args: {},
  returns: queueValidator,
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const monthStart = startOfUtcMonth(now);
    const pending = await ctx.db
      .query("artistRequests")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
    const approved = await ctx.db
      .query("artistRequests")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "approved"))
      .collect();
    const declined = await ctx.db
      .query("artistRequests")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "declined"))
      .collect();

    const rows = [];
    for (const request of pending) {
      rows.push({
        requestId: request._id,
        displayName: request.displayName,
        handle: request.handle,
        bio: request.bio,
        note: request.note,
        email: await emailForProfile(ctx, request.profileId),
        createdAt: request.createdAt,
      });
    }

    return {
      pending: rows,
      pendingCount: pending.length,
      approvedThisMonth: approved.filter(
        (row) => (row.decidedAt ?? 0) >= monthStart
      ).length,
      declinedThisMonth: declined.filter(
        (row) => (row.decidedAt ?? 0) >= monthStart
      ).length,
    };
  },
});

export const approve = authedMutation({
  args: { requestId: v.id("artistRequests") },
  returns: v.id("artists"),
  handler: async (ctx, args) => {
    const { profile: admin } = await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (request === null || request.status !== "pending") {
      raise(ERROR_CODES.INVALID, "That request is no longer pending");
    }

    const linked = await ctx.db
      .query("artists")
      .withIndex("by_profileId", (q) => q.eq("profileId", request.profileId))
      .unique();
    const handle = await allocateHandle(
      ctx,
      request.handle,
      linked?._id ?? null
    );
    const now = Date.now();
    let artistId: Id<"artists">;
    if (linked === null) {
      artistId = await ctx.db.insert("artists", {
        profileId: request.profileId,
        name: request.displayName,
        handle,
        bio: request.bio,
        verified: true,
        hidden: false,
        createdAt: now,
      });
    } else {
      artistId = linked._id;
      await ctx.db.patch(linked._id, {
        name: request.displayName,
        handle,
        bio: request.bio,
        verified: true,
      });
    }
    await ensureArtistStats(ctx, artistId);
    await ctx.db.patch(request._id, {
      status: "approved",
      handle,
      decidedByProfileId: admin._id,
      decidedAt: now,
    });
    return artistId;
  },
});

export const decline = authedMutation({
  args: {
    requestId: v.id("artistRequests"),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile: admin } = await requireAdmin(ctx);
    const request = await ctx.db.get(args.requestId);
    if (request === null || request.status !== "pending") {
      raise(ERROR_CODES.INVALID, "That request is no longer pending");
    }
    const reason = args.reason?.trim() ?? "";
    await ctx.db.patch(request._id, {
      status: "declined",
      decidedByProfileId: admin._id,
      decidedAt: Date.now(),
      ...(reason.length > 0 ? { declineReason: reason } : {}),
    });
    return null;
  },
});

export const listArtists = authedQuery({
  args: {},
  returns: v.array(artistRowValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const artists = await ctx.db.query("artists").collect();
    artists.sort((a, b) => a.name.localeCompare(b.name));
    const rows = [];
    for (const artist of artists) {
      const stats = await ctx.db
        .query("artistStats")
        .withIndex("by_artistId", (q) => q.eq("artistId", artist._id))
        .unique();
      rows.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        verified: artist.verified,
        supporterCount: stats?.supporterCount ?? 0,
        createdAt: artist.createdAt,
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      });
    }
    return rows;
  },
});

export const setVerified = authedMutation({
  args: {
    artistId: v.id("artists"),
    verified: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null) {
      raise(ERROR_CODES.INVALID, "Artist not found");
    }
    await ctx.db.patch(artist._id, { verified: args.verified });
    return null;
  },
});

/** Discover shows six featured artists. More than that is a CMS. */
const FEATURED_SLOT_CAP = 6;

const featuredSlotValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  handle: v.string(),
  bio: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  position: v.number(),
  live: v.boolean(),
});

const featuredArtistValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  handle: v.string(),
  bio: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
});

const hiddenTargetValidator = v.union(
  v.object({ kind: v.literal("track"), id: v.id("tracks") }),
  v.object({ kind: v.literal("post"), id: v.id("updatePosts") }),
  v.object({ kind: v.literal("artist"), id: v.id("artists") }),
  v.object({ kind: v.literal("release"), id: v.id("releases") })
);

export const setHidden = authedMutation({
  args: {
    target: hiddenTargetValidator,
    hidden: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.target.kind === "track") {
      const track = await ctx.db.get(args.target.id);
      if (track === null) {
        raise(ERROR_CODES.INVALID, "Track not found");
      }
      await ctx.db.patch(track._id, { hidden: args.hidden });
      return null;
    }
    if (args.target.kind === "post") {
      const post = await ctx.db.get(args.target.id);
      if (post === null) {
        raise(ERROR_CODES.INVALID, "Update not found");
      }
      await ctx.db.patch(post._id, { hidden: args.hidden });
      return null;
    }
    if (args.target.kind === "artist") {
      const artist = await ctx.db.get(args.target.id);
      if (artist === null) {
        raise(ERROR_CODES.INVALID, "Artist not found");
      }
      await ctx.db.patch(artist._id, { hidden: args.hidden });
      return null;
    }
    const release = await ctx.db.get(args.target.id);
    if (release === null) {
      raise(ERROR_CODES.INVALID, "Release not found");
    }
    await ctx.db.patch(release._id, { hidden: args.hidden });
    const members = await ctx.db
      .query("tracks")
      .withIndex("by_release_position", (q) => q.eq("releaseId", release._id))
      .collect();
    for (const track of members) {
      await ctx.db.patch(track._id, { hidden: args.hidden });
    }
    return null;
  },
});

export const removeTrack = authedMutation({
  args: { trackId: v.id("tracks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const track = await ctx.db.get(args.trackId);
    if (track === null) {
      raise(ERROR_CODES.INVALID, "Track not found");
    }
    const releaseId = track.releaseId;
    await ctx.db.delete(track._id);

    if (releaseId !== undefined) {
      const members = await ctx.db
        .query("tracks")
        .withIndex("by_release_position", (q) => q.eq("releaseId", releaseId))
        .collect();
      members.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      for (const [index, member] of members.entries()) {
        if (member.position !== index) {
          await ctx.db.patch(member._id, { position: index });
        }
      }
    }

    const slots = await ctx.db.query("featuredSlots").collect();
    for (const slot of slots) {
      if (slot.trackId === args.trackId) {
        await ctx.db.delete(slot._id);
      }
    }
    const libraryItems = await ctx.db.query("libraryItems").collect();
    for (const item of libraryItems) {
      if (item.trackId === args.trackId) {
        await ctx.db.delete(item._id);
      }
    }
    const playlistEntries = await ctx.db.query("playlistEntries").collect();
    for (const entry of playlistEntries) {
      if (entry.trackId === args.trackId) {
        await ctx.db.delete(entry._id);
      }
    }
    return null;
  },
});

export const listFeatured = authedQuery({
  args: {},
  returns: v.object({
    slots: v.array(featuredSlotValidator),
    artists: v.array(featuredArtistValidator),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const slots = await ctx.db.query("featuredSlots").collect();
    const active = slots
      .filter(
        (slot) =>
          slot.targetType === "artist" &&
          slot.artistId !== undefined &&
          (slot.activeTo === undefined || slot.activeTo > now)
      )
      .sort((a, b) => a.position - b.position);

    const rows = [];
    for (const slot of active) {
      const artistId = slot.artistId;
      if (artistId === undefined) {
        continue;
      }
      const artist = await ctx.db.get(artistId);
      if (artist === null) {
        continue;
      }
      const live =
        !artist.hidden &&
        slot.activeFrom <= now &&
        (slot.activeTo === undefined || slot.activeTo > now);
      rows.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        bio: artist.bio,
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
        position: rows.length,
        live,
      });
    }

    const artists = await ctx.db.query("artists").collect();
    artists.sort((a, b) => a.name.localeCompare(b.name));
    const candidates = [];
    for (const artist of artists) {
      if (artist.hidden) {
        continue;
      }
      candidates.push({
        artistId: artist._id,
        name: artist.name,
        handle: artist.handle,
        bio: artist.bio,
        avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      });
    }
    return { slots: rows, artists: candidates };
  },
});

export const setFeaturedSlots = authedMutation({
  args: {
    artistIds: v.array(v.id("artists")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireAdmin(ctx);
    if (args.artistIds.length > FEATURED_SLOT_CAP) {
      raise(ERROR_CODES.INVALID, "Featured discovery holds six artists");
    }
    const seen = new Set<string>();
    for (const artistId of args.artistIds) {
      if (seen.has(artistId)) {
        raise(ERROR_CODES.INVALID, "That artist is already featured");
      }
      seen.add(artistId);
      const artist = await ctx.db.get(artistId);
      if (artist === null) {
        raise(ERROR_CODES.INVALID, "Artist not found");
      }
      if (artist.hidden) {
        raise(ERROR_CODES.INVALID, "A hidden artist cannot be featured");
      }
    }

    const existing = await ctx.db.query("featuredSlots").collect();
    for (const slot of existing) {
      await ctx.db.delete(slot._id);
    }
    const now = Date.now();
    for (const [position, artistId] of args.artistIds.entries()) {
      await ctx.db.insert("featuredSlots", {
        position,
        targetType: "artist",
        artistId,
        activeFrom: now,
        createdByProfileId: profile._id,
      });
    }
    return null;
  },
});
