import { getAuthUserId } from "@convex-dev/auth/server";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { ERROR_CODES, raise } from "./errors";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireAuthUserId(ctx: AuthCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    raise(ERROR_CODES.UNAUTHENTICATED);
  }
  return userId as Id<"users">;
}

export async function getProfileByAuthUserId(
  ctx: AuthCtx,
  userId: Id<"users">
): Promise<Doc<"profiles"> | null> {
  return await ctx.db
    .query("profiles")
    .withIndex("by_authUserId", (q) => q.eq("authUserId", userId))
    .unique();
}

export async function getVerifiedArtistForProfile(
  ctx: AuthCtx,
  profileId: Id<"profiles">
): Promise<Doc<"artists"> | null> {
  const artist = await ctx.db
    .query("artists")
    .withIndex("by_profileId", (q) => q.eq("profileId", profileId))
    .unique();
  if (artist === null || !artist.verified || artist.hidden) {
    return null;
  }
  return artist;
}

export function canAccessStudio(args: {
  isAdmin: boolean;
  verifiedArtist: Doc<"artists"> | null;
}): boolean {
  return args.isAdmin || args.verifiedArtist !== null;
}

export async function requireProfile(ctx: AuthCtx): Promise<{
  userId: Id<"users">;
  profile: Doc<"profiles">;
}> {
  const userId = await requireAuthUserId(ctx);
  const profile = await getProfileByAuthUserId(ctx, userId);
  if (profile === null) {
    raise(ERROR_CODES.UNAUTHENTICATED, "Profile not found");
  }
  return { userId, profile };
}

export async function requireAdmin(ctx: AuthCtx): Promise<{
  userId: Id<"users">;
  profile: Doc<"profiles">;
}> {
  const session = await requireProfile(ctx);
  if (!session.profile.isAdmin) {
    raise(ERROR_CODES.NOT_PERMITTED);
  }
  return session;
}

export async function requireStudioAccess(ctx: AuthCtx): Promise<{
  userId: Id<"users">;
  profile: Doc<"profiles">;
  verifiedArtist: Doc<"artists"> | null;
}> {
  const session = await requireProfile(ctx);
  const verifiedArtist = await getVerifiedArtistForProfile(
    ctx,
    session.profile._id
  );
  if (
    !canAccessStudio({
      isAdmin: session.profile.isAdmin,
      verifiedArtist,
    })
  ) {
    raise(ERROR_CODES.NOT_PERMITTED, "Studio access requires artist or admin");
  }
  return { ...session, verifiedArtist };
}
