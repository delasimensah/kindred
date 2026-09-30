import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { decidePostAccess, isLocked } from "./lib/access";
import { gateForArtist, loadSupporterAccess } from "./lib/supporterAccess";
import { requireProfile, requireVerifiedArtist } from "./lib/auth";
import { ERROR_CODES, raise } from "./lib/errors";
import { fileUrl } from "./lib/files";
import { authedMutation, authedQuery } from "./lib/functions";
import { VOICE_PEAK_BUCKETS } from "./lib/tracks";

const BODY_MAX = 500;
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const VOICE_MAX_BYTES = 20 * 1024 * 1024;
const VOICE_MAX_DURATION_MS = 5 * 60 * 1000;

const audienceValidator = v.union(
  v.literal("everyone"),
  v.literal("supporters")
);

const artistPostValidator = v.object({
  postId: v.id("updatePosts"),
  createdAt: v.number(),
  audience: audienceValidator,
  body: v.union(v.string(), v.null()),
  locked: v.boolean(),
  photoUrl: v.union(v.string(), v.null()),
  voiceDurationMs: v.union(v.number(), v.null()),
  voiceUrl: v.union(v.string(), v.null()),
  voicePeaks: v.array(v.number()),
});

const studioPostValidator = v.object({
  postId: v.id("updatePosts"),
  createdAt: v.number(),
  audience: audienceValidator,
  body: v.string(),
  photoUrl: v.union(v.string(), v.null()),
  voiceDurationMs: v.union(v.number(), v.null()),
  voiceUrl: v.union(v.string(), v.null()),
  voicePeaks: v.array(v.number()),
});

function normalizeBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    raise(ERROR_CODES.INVALID, "Write something before posting");
  }
  if (trimmed.length > BODY_MAX) {
    raise(
      ERROR_CODES.INVALID,
      `Update must be ${BODY_MAX} characters or fewer`
    );
  }
  return trimmed;
}

function assertVoicePeaks(peaks: number[]) {
  if (peaks.length !== VOICE_PEAK_BUCKETS) {
    raise(
      ERROR_CODES.INVALID,
      `Voice peaks must be exactly ${VOICE_PEAK_BUCKETS} values`
    );
  }
  for (const peak of peaks) {
    if (!Number.isFinite(peak) || peak < 0 || peak > 1) {
      raise(ERROR_CODES.INVALID, "Each voice peak must be between 0 and 1");
    }
  }
}

async function requireOwnedMedia(
  ctx: MutationCtx,
  artistId: Id<"artists">,
  fileId: Id<"files">,
  kind: "updatePhoto" | "voiceNote"
) {
  const file = await ctx.db.get(fileId);
  if (file === null || file.artistId !== artistId || file.kind !== kind) {
    raise(
      ERROR_CODES.INVALID,
      kind === "updatePhoto"
        ? "Photo file is not yours"
        : "Voice note file is not yours"
    );
  }
  return file;
}

async function requireOwnPost(
  ctx: MutationCtx | QueryCtx,
  postId: Id<"updatePosts">
) {
  const { artist } = await requireVerifiedArtist(ctx);
  const post = await ctx.db.get(postId);
  if (post === null || post.artistId !== artist._id) {
    raise(ERROR_CODES.NOT_PERMITTED);
  }
  return { artist, post };
}

function resolveVoiceFields(args: {
  voiceFileId?: Id<"files">;
  voiceDurationMs?: number;
  voicePeaks?: number[];
}): { voiceDurationMs: number; voicePeaks: number[] } {
  if (
    args.voiceDurationMs === undefined ||
    !Number.isFinite(args.voiceDurationMs) ||
    args.voiceDurationMs <= 0
  ) {
    raise(ERROR_CODES.INVALID, "Voice note duration is required");
  }
  if (args.voiceDurationMs > VOICE_MAX_DURATION_MS) {
    raise(ERROR_CODES.INVALID, "Voice note must be 5 minutes or shorter");
  }
  if (args.voicePeaks === undefined) {
    raise(ERROR_CODES.INVALID, "Voice note peaks are required");
  }
  assertVoicePeaks(args.voicePeaks);
  return {
    voiceDurationMs: Math.round(args.voiceDurationMs),
    voicePeaks: args.voicePeaks,
  };
}

export const listForArtist = authedQuery({
  args: { artistId: v.id("artists") },
  returns: v.array(artistPostValidator),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const artist = await ctx.db.get(args.artistId);
    if (artist === null || artist.hidden) {
      return [];
    }
    const isOwner = artist.profileId === profile._id;
    const supporter = await loadSupporterAccess(ctx, profile._id);
    const gate = gateForArtist(supporter, args.artistId);
    const posts = await ctx.db
      .query("updatePosts")
      .withIndex("by_artist_createdAt", (q) => q.eq("artistId", args.artistId))
      .order("desc")
      .take(20);
    const rows = [];
    for (const post of posts) {
      if (post.hidden) {
        continue;
      }
      const locked = isLocked(decidePostAccess(post, isOwner, gate));
      rows.push({
        postId: post._id,
        createdAt: post.createdAt,
        audience: post.audience,
        body: locked ? null : post.body,
        locked,
        photoUrl: locked ? null : await fileUrl(ctx, post.photoFileId),
        voiceDurationMs: locked ? null : (post.voiceDurationMs ?? null),
        voiceUrl: locked ? null : await fileUrl(ctx, post.voiceFileId),
        voicePeaks: locked ? [] : (post.voicePeaks ?? []),
      });
    }
    return rows;
  },
});

export const listMine = authedQuery({
  args: {},
  returns: v.array(studioPostValidator),
  handler: async (ctx) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const posts = await ctx.db
      .query("updatePosts")
      .withIndex("by_artist_createdAt", (q) => q.eq("artistId", artist._id))
      .order("desc")
      .take(50);
    const rows = [];
    for (const post of posts) {
      if (post.hidden) {
        continue;
      }
      rows.push({
        postId: post._id,
        createdAt: post.createdAt,
        audience: post.audience,
        body: post.body,
        photoUrl: await fileUrl(ctx, post.photoFileId),
        voiceDurationMs: post.voiceDurationMs ?? null,
        voiceUrl: await fileUrl(ctx, post.voiceFileId),
        voicePeaks: post.voicePeaks ?? [],
      });
    }
    return rows;
  },
});

export const generateUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireVerifiedArtist(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const registerPhoto = authedMutation({
  args: {
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    const { profile, artist } = await requireVerifiedArtist(ctx);
    if (!args.contentType.startsWith("image/")) {
      raise(ERROR_CODES.INVALID, "Upload an image file");
    }
    if (args.sizeBytes <= 0) {
      raise(ERROR_CODES.INVALID, "File is empty");
    }
    if (args.sizeBytes > PHOTO_MAX_BYTES) {
      raise(ERROR_CODES.INVALID, "Photo must be 10MB or smaller");
    }
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      kind: "updatePhoto",
      ownerProfileId: profile._id,
      artistId: artist._id,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      createdAt: Date.now(),
    });
  },
});

export const registerVoice = authedMutation({
  args: {
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    const { profile, artist } = await requireVerifiedArtist(ctx);
    if (!args.contentType.startsWith("audio/")) {
      raise(ERROR_CODES.INVALID, "Upload an audio file");
    }
    if (args.sizeBytes <= 0) {
      raise(ERROR_CODES.INVALID, "File is empty");
    }
    if (args.sizeBytes > VOICE_MAX_BYTES) {
      raise(ERROR_CODES.INVALID, "Voice note must be 20MB or smaller");
    }
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      kind: "voiceNote",
      ownerProfileId: profile._id,
      artistId: artist._id,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      createdAt: Date.now(),
    });
  },
});

export const create = authedMutation({
  args: {
    body: v.string(),
    audience: audienceValidator,
    photoFileId: v.optional(v.id("files")),
    voiceFileId: v.optional(v.id("files")),
    voiceDurationMs: v.optional(v.number()),
    voicePeaks: v.optional(v.array(v.number())),
  },
  returns: v.id("updatePosts"),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const body = normalizeBody(args.body);

    if (args.photoFileId !== undefined) {
      await requireOwnedMedia(ctx, artist._id, args.photoFileId, "updatePhoto");
    }

    let voiceDurationMs: number | undefined;
    let voicePeaks: number[] | undefined;
    if (args.voiceFileId !== undefined) {
      await requireOwnedMedia(ctx, artist._id, args.voiceFileId, "voiceNote");
      const voice = resolveVoiceFields(args);
      voiceDurationMs = voice.voiceDurationMs;
      voicePeaks = voice.voicePeaks;
    } else if (
      args.voiceDurationMs !== undefined ||
      args.voicePeaks !== undefined
    ) {
      raise(ERROR_CODES.INVALID, "Voice peaks need a voice file");
    }

    // Follower pushes land when the push outbox ships (KIND-62).
    return await ctx.db.insert("updatePosts", {
      artistId: artist._id,
      body,
      audience: args.audience,
      hidden: false,
      createdAt: Date.now(),
      ...(args.photoFileId === undefined
        ? {}
        : { photoFileId: args.photoFileId }),
      ...(args.voiceFileId === undefined
        ? {}
        : {
            voiceFileId: args.voiceFileId,
            voiceDurationMs,
            voicePeaks,
          }),
    });
  },
});

export const getMine = authedQuery({
  args: { postId: v.id("updatePosts") },
  returns: v.union(
    v.object({
      postId: v.id("updatePosts"),
      createdAt: v.number(),
      audience: audienceValidator,
      body: v.string(),
      photoUrl: v.union(v.string(), v.null()),
      hasPhoto: v.boolean(),
      voiceDurationMs: v.union(v.number(), v.null()),
      voiceUrl: v.union(v.string(), v.null()),
      voicePeaks: v.array(v.number()),
      hasVoice: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const { artist } = await requireVerifiedArtist(ctx);
    const post = await ctx.db.get(args.postId);
    if (post === null || post.artistId !== artist._id || post.hidden) {
      return null;
    }
    return {
      postId: post._id,
      createdAt: post.createdAt,
      audience: post.audience,
      body: post.body,
      photoUrl: await fileUrl(ctx, post.photoFileId),
      hasPhoto: post.photoFileId !== undefined,
      voiceDurationMs: post.voiceDurationMs ?? null,
      voiceUrl: await fileUrl(ctx, post.voiceFileId),
      voicePeaks: post.voicePeaks ?? [],
      hasVoice: post.voiceFileId !== undefined,
    };
  },
});

export const update = authedMutation({
  args: {
    postId: v.id("updatePosts"),
    body: v.string(),
    audience: audienceValidator,
    photoFileId: v.optional(v.id("files")),
    removePhoto: v.optional(v.boolean()),
    voiceFileId: v.optional(v.id("files")),
    voiceDurationMs: v.optional(v.number()),
    voicePeaks: v.optional(v.array(v.number())),
    removeVoice: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { artist, post } = await requireOwnPost(ctx, args.postId);
    const body = normalizeBody(args.body);

    if (args.photoFileId !== undefined && args.removePhoto === true) {
      raise(ERROR_CODES.INVALID, "Cannot replace and remove the photo");
    }
    if (args.voiceFileId !== undefined && args.removeVoice === true) {
      raise(ERROR_CODES.INVALID, "Cannot replace and remove the voice note");
    }

    let nextPhotoFileId = post.photoFileId;
    if (args.photoFileId !== undefined) {
      await requireOwnedMedia(ctx, artist._id, args.photoFileId, "updatePhoto");
      nextPhotoFileId = args.photoFileId;
    } else if (args.removePhoto === true) {
      nextPhotoFileId = undefined;
    }

    let nextVoiceFileId = post.voiceFileId;
    let nextVoiceDurationMs = post.voiceDurationMs;
    let nextVoicePeaks = post.voicePeaks;
    if (args.voiceFileId !== undefined) {
      await requireOwnedMedia(ctx, artist._id, args.voiceFileId, "voiceNote");
      const voice = resolveVoiceFields(args);
      nextVoiceFileId = args.voiceFileId;
      nextVoiceDurationMs = voice.voiceDurationMs;
      nextVoicePeaks = voice.voicePeaks;
    } else if (args.removeVoice === true) {
      nextVoiceFileId = undefined;
      nextVoiceDurationMs = undefined;
      nextVoicePeaks = undefined;
    } else if (
      args.voiceDurationMs !== undefined ||
      args.voicePeaks !== undefined
    ) {
      raise(ERROR_CODES.INVALID, "Voice peaks need a voice file");
    }

    await ctx.db.patch(post._id, {
      body,
      audience: args.audience,
      photoFileId: nextPhotoFileId,
      voiceFileId: nextVoiceFileId,
      voiceDurationMs: nextVoiceDurationMs,
      voicePeaks: nextVoicePeaks,
    });
    return null;
  },
});

export const remove = authedMutation({
  args: { postId: v.id("updatePosts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { post } = await requireOwnPost(ctx, args.postId);
    await ctx.db.delete(post._id);
    return null;
  },
});
