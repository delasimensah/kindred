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
