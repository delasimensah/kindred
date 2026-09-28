import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";
import { decidePostAccess, decideTrackAccess, isLocked } from "./lib/access";
import { fileUrl } from "./lib/files";

const TRACK_CAP = 12;
const MORE_CAP = 6;
const RELEASE_CAP = 8;
const POST_CAP = 6;
const PREVIEW_CAP = 160;

const publicTrackValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  artistId: v.id("artists"),
  artistName: v.string(),
  artistHandle: v.string(),
  artworkUrl: v.union(v.string(), v.null()),
  durationMs: v.number(),
  locked: v.boolean(),
  kindLabel: v.string(),
});

const releaseValidator = v.object({
  releaseId: v.id("releases"),
  title: v.string(),
  type: v.union(v.literal("ep"), v.literal("album")),
  artworkUrl: v.union(v.string(), v.null()),
  publishedAt: v.union(v.number(), v.null()),
  locked: v.boolean(),
  tracks: v.array(publicTrackValidator),
});

const postPreviewValidator = v.object({
  postId: v.id("updatePosts"),
  createdAt: v.number(),
  locked: v.boolean(),
  preview: v.union(v.string(), v.null()),
});

async function listedArtist(ctx: QueryCtx, artistId: Id<"artists">) {
  const artist = await ctx.db.get(artistId);
  if (artist === null || artist.hidden) {
    return null;
  }
  return artist;
}

function isOnPublicCatalog(track: Doc<"tracks">) {
  return track.state === "published" && !track.hidden;
}

async function kindLabel(ctx: QueryCtx, track: Doc<"tracks">): Promise<string> {
  if (track.releaseId === undefined) {
    return "Single";
  }
  const release = await ctx.db.get(track.releaseId);
  if (release === null || release.hidden || release.state !== "published") {
    return "Single";
  }
  return release.type === "ep" ? "EP" : "Album";
}

async function toPublicTrack(
  ctx: QueryCtx,
  track: Doc<"tracks">,
  artist: Doc<"artists">
) {
  const locked = isLocked(decideTrackAccess(track, false));
  return {
    trackId: track._id,
    title: track.title,
    artistId: artist._id,
    artistName: artist.name,
    artistHandle: artist.handle,
    artworkUrl: await fileUrl(ctx, track.artworkFileId),
    durationMs: track.durationMs,
    locked,
    kindLabel: await kindLabel(ctx, track),
  };
}

async function publishedTracks(ctx: QueryCtx, artistId: Id<"artists">) {
  const published = await ctx.db
    .query("tracks")
    .withIndex("by_artist_state_publishedAt", (q) =>
      q.eq("artistId", artistId).eq("state", "published")
    )
    .order("desc")
    .collect();
  return published.filter((track) => !track.hidden);
}

export const artist = query({
  args: { handle: v.string() },
  returns: v.union(
    v.object({
      artistId: v.id("artists"),
      name: v.string(),
      handle: v.string(),
      bio: v.string(),
      avatarUrl: v.union(v.string(), v.null()),
      coverUrl: v.union(v.string(), v.null()),
      followerCount: v.number(),
      tracks: v.array(publicTrackValidator),
      releases: v.array(releaseValidator),
      posts: v.array(postPreviewValidator),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const artistRow = await ctx.db
      .query("artists")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (artistRow === null || artistRow.hidden) {
      return null;
    }
    const stats = await ctx.db
      .query("artistStats")
      .withIndex("by_artistId", (q) => q.eq("artistId", artistRow._id))
      .unique();
    const tracks = [];
    for (const track of (await publishedTracks(ctx, artistRow._id)).slice(
      0,
      TRACK_CAP
    )) {
      tracks.push(await toPublicTrack(ctx, track, artistRow));
    }
    const publishedReleases = await ctx.db
      .query("releases")
      .withIndex("by_artist_state_publishedAt", (q) =>
        q.eq("artistId", artistRow._id).eq("state", "published")
      )
      .order("desc")
      .collect();
    const releases = [];
    for (const release of publishedReleases
      .filter((row) => !row.hidden)
      .slice(0, RELEASE_CAP)) {
      const locked = release.visibility === "supporters";
      const members = locked
        ? []
        : (
            await ctx.db
              .query("tracks")
              .withIndex("by_release_position", (q) =>
                q.eq("releaseId", release._id)
              )
              .collect()
          )
            .filter(isOnPublicCatalog)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      const releaseTracks = [];
      for (const track of members) {
        releaseTracks.push(await toPublicTrack(ctx, track, artistRow));
      }
      releases.push({
        releaseId: release._id,
        title: release.title,
        type: release.type,
        artworkUrl: await fileUrl(ctx, release.artworkFileId),
        publishedAt: release.publishedAt ?? null,
        locked,
        tracks: releaseTracks,
      });
    }
    const recentPosts = await ctx.db
      .query("updatePosts")
      .withIndex("by_artist_createdAt", (q) => q.eq("artistId", artistRow._id))
      .order("desc")
      .take(20);
    const posts = [];
    for (const post of recentPosts) {
      if (post.hidden || posts.length >= POST_CAP) {
        continue;
      }
      const locked = isLocked(decidePostAccess(post, false));
      posts.push({
        postId: post._id,
        createdAt: post.createdAt,
        locked,
        preview: locked ? null : post.body.slice(0, PREVIEW_CAP),
      });
    }
    return {
      artistId: artistRow._id,
      name: artistRow.name,
      handle: artistRow.handle,
      bio: artistRow.bio,
      avatarUrl: await fileUrl(ctx, artistRow.avatarFileId),
      coverUrl: await fileUrl(ctx, artistRow.coverFileId),
      followerCount: stats?.followerCount ?? 0,
      tracks,
      releases,
      posts,
    };
  },
});

export const track = query({
  args: { trackId: v.string() },
  returns: v.union(
    v.object({
      track: publicTrackValidator,
      description: v.union(v.string(), v.null()),
      publishedAt: v.union(v.number(), v.null()),
      artistAvatarUrl: v.union(v.string(), v.null()),
      more: v.array(publicTrackValidator),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const trackId = ctx.db.normalizeId("tracks", args.trackId);
    if (trackId === null) {
      return null;
    }
    const trackRow = await ctx.db.get(trackId);
    if (trackRow === null || !isOnPublicCatalog(trackRow)) {
      return null;
    }
    const artistRow = await listedArtist(ctx, trackRow.artistId);
    if (artistRow === null) {
      return null;
    }
    const access = decideTrackAccess(trackRow, false);
    if (!access.allowed && !isLocked(access)) {
      return null;
    }
    const locked = isLocked(access);
    const more = [];
    for (const other of await publishedTracks(ctx, artistRow._id)) {
      if (other._id === trackRow._id || more.length >= MORE_CAP) {
        continue;
      }
      more.push(await toPublicTrack(ctx, other, artistRow));
    }
    return {
      track: await toPublicTrack(ctx, trackRow, artistRow),
      description: locked ? null : (trackRow.description ?? null),
      publishedAt: trackRow.publishedAt ?? null,
      artistAvatarUrl: await fileUrl(ctx, artistRow.avatarFileId),
      more,
    };
  },
});

export const post = query({
  args: { postId: v.string() },
  returns: v.union(
    v.object({
      postId: v.id("updatePosts"),
      artistName: v.string(),
      artistHandle: v.string(),
      avatarUrl: v.union(v.string(), v.null()),
      createdAt: v.number(),
      locked: v.boolean(),
      body: v.union(v.string(), v.null()),
      photoUrl: v.union(v.string(), v.null()),
      hasVoice: v.boolean(),
      voiceDurationMs: v.union(v.number(), v.null()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const postId = ctx.db.normalizeId("updatePosts", args.postId);
    if (postId === null) {
      return null;
    }
    const postRow = await ctx.db.get(postId);
    if (postRow === null || postRow.hidden) {
      return null;
    }
    const artistRow = await listedArtist(ctx, postRow.artistId);
    if (artistRow === null) {
      return null;
    }
    const access = decidePostAccess(postRow, false);
    if (!access.allowed && !isLocked(access)) {
      return null;
    }
    const locked = isLocked(access);
    return {
      postId: postRow._id,
      artistName: artistRow.name,
      artistHandle: artistRow.handle,
      avatarUrl: await fileUrl(ctx, artistRow.avatarFileId),
      createdAt: postRow.createdAt,
      locked,
      body: locked ? null : postRow.body,
      photoUrl: locked ? null : await fileUrl(ctx, postRow.photoFileId),
      hasVoice: locked ? false : postRow.voiceFileId !== undefined,
      voiceDurationMs: locked ? null : (postRow.voiceDurationMs ?? null),
    };
  },
});

export const mix = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      slug: v.string(),
      name: v.string(),
      why: v.string(),
      curatorName: v.string(),
      artworkUrl: v.union(v.string(), v.null()),
      tracks: v.array(publicTrackValidator),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const mixRow = await ctx.db
      .query("mixes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (mixRow === null) {
      return null;
    }
    const profile = await ctx.db.get(mixRow.profileId);
    const tracks = [];
    let artworkUrl: string | null = null;
    for (const trackId of mixRow.trackIds) {
      const trackRow = await ctx.db.get(trackId);
      if (trackRow === null || !isOnPublicCatalog(trackRow)) {
        continue;
      }
      const artistRow = await listedArtist(ctx, trackRow.artistId);
      if (artistRow === null) {
        continue;
      }
      const row = await toPublicTrack(ctx, trackRow, artistRow);
      if (artworkUrl === null && row.artworkUrl !== null) {
        artworkUrl = row.artworkUrl;
      }
      tracks.push(row);
    }
    return {
      slug: mixRow.slug,
      name: mixRow.name,
      why: mixRow.why,
      curatorName: profile?.displayName ?? "Kindred",
      artworkUrl,
      tracks,
    };
  },
});

const sourceValidator = v.union(
  v.object({
    audioUrl: v.string(),
    durationMs: v.number(),
  }),
  v.null()
);

export const playbackUrl = query({
  args: { trackId: v.string() },
  returns: sourceValidator,
  handler: async (ctx, args) => {
    const trackId = ctx.db.normalizeId("tracks", args.trackId);
    if (trackId === null) {
      return null;
    }
    const trackRow = await ctx.db.get(trackId);
    if (trackRow === null || !isOnPublicCatalog(trackRow)) {
      return null;
    }
    const artistRow = await listedArtist(ctx, trackRow.artistId);
    if (artistRow === null) {
      return null;
    }
    if (!decideTrackAccess(trackRow, false).allowed) {
      return null;
    }
    const audioUrl = await fileUrl(ctx, trackRow.audioFileId);
    if (audioUrl === null) {
      return null;
    }
    return { audioUrl, durationMs: trackRow.durationMs };
  },
});

export const voiceUrl = query({
  args: { postId: v.string() },
  returns: sourceValidator,
  handler: async (ctx, args) => {
    const postId = ctx.db.normalizeId("updatePosts", args.postId);
    if (postId === null) {
      return null;
    }
    const postRow = await ctx.db.get(postId);
    if (
      postRow === null ||
      postRow.hidden ||
      postRow.voiceFileId === undefined
    ) {
      return null;
    }
    const artistRow = await listedArtist(ctx, postRow.artistId);
    if (artistRow === null) {
      return null;
    }
    if (!decidePostAccess(postRow, false).allowed) {
      return null;
    }
    const audioUrl = await fileUrl(ctx, postRow.voiceFileId);
    if (audioUrl === null) {
      return null;
    }
    return {
      audioUrl,
      durationMs: postRow.voiceDurationMs ?? 0,
    };
  },
});
