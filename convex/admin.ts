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
