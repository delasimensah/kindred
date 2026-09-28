import { v } from "convex/values";
import {
  ARTIST_REQUEST_BIO_MAX,
  ARTIST_REQUEST_NAME_MAX,
  ARTIST_REQUEST_WHY_MAX,
} from "shared";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireProfile } from "./lib/auth";
import {
  handleBaseFromDisplayName,
  handleWithSuffix,
} from "./lib/artistRequestHandle";
import { ERROR_CODES, raise } from "./lib/errors";
import { authedMutation, authedQuery } from "./lib/functions";

const statusValidator = v.union(
  v.literal("none"),
  v.literal("pending"),
  v.literal("approved"),
  v.literal("declined")
);

const mineValidator = v.object({
  status: statusValidator,
  displayName: v.string(),
  bio: v.string(),
  note: v.string(),
  declineReason: v.union(v.string(), v.null()),
  createdAt: v.union(v.number(), v.null()),
});

type ReadCtx = QueryCtx | MutationCtx;

function requiredText(
  value: string,
  max: number,
  emptyMessage: string,
  longMessage: string
): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    raise(ERROR_CODES.INVALID, emptyMessage);
  }
  if (trimmed.length > max) {
    raise(ERROR_CODES.INVALID, longMessage);
  }
  return trimmed;
}

async function latestRequest(
  ctx: ReadCtx,
  profileId: Id<"profiles">
): Promise<Doc<"artistRequests"> | null> {
  return await ctx.db
    .query("artistRequests")
    .withIndex("by_profile_createdAt", (q) => q.eq("profileId", profileId))
    .order("desc")
    .first();
}

async function linkedArtist(
  ctx: ReadCtx,
  profileId: Id<"profiles">
): Promise<Doc<"artists"> | null> {
  return await ctx.db
    .query("artists")
    .withIndex("by_profileId", (q) => q.eq("profileId", profileId))
    .unique();
}

async function handleTaken(ctx: MutationCtx, handle: string): Promise<boolean> {
  const artist = await ctx.db
    .query("artists")
    .withIndex("by_handle", (q) => q.eq("handle", handle))
    .unique();
  if (artist !== null) {
    return true;
  }
  const pending = await ctx.db
    .query("artistRequests")
    .withIndex("by_status_createdAt", (q) => q.eq("status", "pending"))
    .collect();
  return pending.some((row) => row.handle === handle);
}

async function allocateHandle(
  ctx: MutationCtx,
  displayName: string
): Promise<string> {
  const base = handleBaseFromDisplayName(displayName);
  for (let suffix = 1; suffix <= 50; suffix += 1) {
    const handle = suffix === 1 ? base : handleWithSuffix(base, suffix);
    if (!(await handleTaken(ctx, handle))) {
      return handle;
    }
  }
  raise(ERROR_CODES.INVALID, "Choose a different display name");
}

export const getMine = authedQuery({
  args: {},
  returns: mineValidator,
  handler: async (ctx) => {
    const { profile } = await requireProfile(ctx);
    const artist = await linkedArtist(ctx, profile._id);
    const latest = await latestRequest(ctx, profile._id);

    if (artist !== null || latest?.status === "approved") {
      return {
        status: "approved" as const,
        displayName: latest?.displayName ?? artist?.name ?? profile.displayName,
        bio: latest?.bio ?? artist?.bio ?? "",
        note: latest?.note ?? "",
        declineReason: null,
        createdAt: latest?.createdAt ?? null,
      };
    }

    if (latest === null) {
      return {
        status: "none" as const,
        displayName: profile.displayName,
        bio: "",
        note: "",
        declineReason: null,
        createdAt: null,
      };
    }

    return {
      status: latest.status,
      displayName: latest.displayName,
      bio: latest.bio,
      note: latest.note,
      declineReason: latest.declineReason ?? null,
      createdAt: latest.createdAt,
    };
  },
});

export const submit = authedMutation({
  args: {
    displayName: v.string(),
    bio: v.string(),
    note: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireProfile(ctx);
    const artist = await linkedArtist(ctx, profile._id);
    if (artist !== null) {
      raise(ERROR_CODES.NOT_PERMITTED, "You are already an artist");
    }

    const latest = await latestRequest(ctx, profile._id);
    if (latest?.status === "pending") {
      raise(
        ERROR_CODES.NOT_PERMITTED,
        "You already have a request waiting for review"
      );
    }
    if (latest?.status === "approved") {
      raise(ERROR_CODES.NOT_PERMITTED, "You are already an artist");
    }

    const displayName = requiredText(
      args.displayName,
      ARTIST_REQUEST_NAME_MAX,
      "Enter a display name",
      `Display name must be ${ARTIST_REQUEST_NAME_MAX} characters or fewer`
    );
    const bio = requiredText(
      args.bio,
      ARTIST_REQUEST_BIO_MAX,
      "Enter a bio",
      `Bio must be ${ARTIST_REQUEST_BIO_MAX} characters or fewer`
    );
    const note = requiredText(
      args.note,
      ARTIST_REQUEST_WHY_MAX,
      "Tell us why you want to join",
      `Why must be ${ARTIST_REQUEST_WHY_MAX} characters or fewer`
    );
    const handle = await allocateHandle(ctx, displayName);

    await ctx.db.insert("artistRequests", {
      profileId: profile._id,
      displayName,
      handle,
      bio,
      note,
      status: "pending",
      createdAt: Date.now(),
    });
    return null;
  },
});
