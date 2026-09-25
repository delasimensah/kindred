import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  getVerifiedArtistForProfile,
  requireProfile,
  requireVerifiedArtist,
} from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { authedMutation, authedQuery } from "./lib/functions";

const BIO_MAX = 300;

const releaseCardValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  state: v.union(
    v.literal("draft"),
    v.literal("scheduled"),
    v.literal("published")
  ),
  artworkUrl: v.union(v.string(), v.null()),
  publishedAt: v.union(v.number(), v.null()),
  publishAt: v.union(v.number(), v.null()),
});

const homeValidator = v.object({
  artistId: v.id("artists"),
  artistName: v.string(),
  handle: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  supporterCount: v.number(),
  scheduledCount: v.number(),
  nextScheduledAt: v.union(v.number(), v.null()),
  thankYouCount: v.number(),
  recentReleases: v.array(releaseCardValidator),
  recentThankYous: v.array(
    v.object({
      id: v.string(),
      fanName: v.string(),
      body: v.string(),
      sentAt: v.number(),
    })
  ),
});

const profileEditorValidator = v.object({
  artistId: v.id("artists"),
  name: v.string(),
  handle: v.string(),
  bio: v.string(),
  avatarUrl: v.union(v.string(), v.null()),
  coverUrl: v.union(v.string(), v.null()),
  verified: v.boolean(),
  hidden: v.boolean(),
});

type FileCtx = QueryCtx | MutationCtx;

async function releaseCard(ctx: FileCtx, track: Doc<"tracks">) {
  return {
    trackId: track._id,
    title: track.title,
    state: track.state,
    artworkUrl: await fileUrl(ctx, track.artworkFileId),
    publishedAt: track.publishedAt ?? null,
    publishAt: track.publishAt ?? null,
  };
}

export const getHome = authedQuery({
  args: {},
  returns: v.union(homeValidator, v.null()),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const artist = await getVerifiedArtistForProfile(ctx, profile._id);
    if (artist === null) {
      return null;
    }

    const stats = await ctx.db
      .query("artistStats")
      .withIndex("by_artistId", (q) => q.eq("artistId", artist._id))
      .unique();

    const published = await ctx.db
      .query("tracks")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", artist._id).eq("state", "published")
      )
      .order("desc")
      .take(12);
    const scheduled = await ctx.db
      .query("tracks")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", artist._id).eq("state", "scheduled")
      )
      .collect();
    const visiblePublished = published.filter((track) => !track.hidden);
    const visibleScheduled = scheduled
      .filter((track) => !track.hidden)
      .sort((a, b) => (a.publishAt ?? 0) - (b.publishAt ?? 0));

    const combined = [
      ...visibleScheduled.slice(0, 3),
      ...visiblePublished.slice(0, 6),
    ].slice(0, 6);

    const recentReleases = [];
    for (const track of combined) {
      recentReleases.push(await releaseCard(ctx, track));
    }

    return {
      artistId: artist._id,
      artistName: artist.name,
      handle: artist.handle,
      avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      supporterCount: stats?.supporterCount ?? 0,
      scheduledCount: visibleScheduled.length,
      nextScheduledAt: visibleScheduled[0]?.publishAt ?? null,
      thankYouCount: 0,
      recentReleases,
      recentThankYous: [],
    };
  },
});

export const getMyProfile = authedQuery({
  args: {},
  returns: v.union(profileEditorValidator, v.null()),
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const artist = await getVerifiedArtistForProfile(ctx, profile._id);
    if (artist === null) {
      return null;
    }
    return {
      artistId: artist._id,
      name: artist.name,
      handle: artist.handle,
      bio: artist.bio,
      avatarUrl: await fileUrl(ctx, artist.avatarFileId),
      coverUrl: await fileUrl(ctx, artist.coverFileId),
      verified: artist.verified,
      hidden: artist.hidden,
    };
  },
});

export const updateMyProfile = authedMutation({
  args: {
    name: v.string(),
    bio: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const name = args.name.trim();
    const bio = args.bio.trim();
    if (name.length === 0) {
      raise(ERROR_CODES.INVALID, "Display name is required");
    }
    if (bio.length > BIO_MAX) {
      raise(ERROR_CODES.INVALID, `Bio must be ${BIO_MAX} characters or fewer`);
    }
    await ctx.db.patch(artist._id, { name, bio });
    return null;
  },
});

export const generateImageUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireVerifiedArtist(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

async function attachArtistImage(
  ctx: MutationCtx,
  args: {
    storageId: Id<"_storage">;
    kind: "avatar" | "cover";
    contentType: string;
    sizeBytes: number;
  }
): Promise<null> {
  const { profile, artist } = await requireVerifiedArtist(ctx);
  if (!args.contentType.startsWith("image/")) {
    raise(ERROR_CODES.INVALID, "Upload an image file");
  }
  const fileId = await ctx.db.insert("files", {
    storageId: args.storageId,
    kind: args.kind,
    ownerProfileId: profile._id,
    artistId: artist._id,
    contentType: args.contentType,
    sizeBytes: args.sizeBytes,
    createdAt: Date.now(),
  });
  if (args.kind === "avatar") {
    await ctx.db.patch(artist._id, { avatarFileId: fileId });
  } else {
    await ctx.db.patch(artist._id, { coverFileId: fileId });
  }
  return null;
}

export const saveAvatar = authedMutation({
  args: {
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await attachArtistImage(ctx, { ...args, kind: "avatar" });
  },
});

export const saveCover = authedMutation({
  args: {
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await attachArtistImage(ctx, { ...args, kind: "cover" });
  },
});
