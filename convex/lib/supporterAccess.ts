import { FOUNDING_SUPPORTER_LIMIT } from "shared";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { bumpSupporterCount } from "./artistStats";

export type SupporterAccess = {
  entitled: boolean;
  routedArtistIds: Set<Id<"artists">>;
};

export async function loadSupporterAccess(
  ctx: QueryCtx | MutationCtx,
  profileId: Id<"profiles">,
  now = Date.now()
): Promise<SupporterAccess> {
  const entitlement = await ctx.db
    .query("entitlements")
    .withIndex("by_profileId", (q) => q.eq("profileId", profileId))
    .unique();
  const entitled =
    entitlement !== null &&
    entitlement.status === "active" &&
    entitlement.currentPeriodEnd > now;
  const routes = await ctx.db
    .query("supportRoutes")
    .withIndex("by_profile_active", (q) =>
      q.eq("profileId", profileId).eq("active", true)
    )
    .collect();
  return {
    entitled,
    routedArtistIds: new Set(routes.map((route) => route.artistId)),
  };
}

export function gateForArtist(
  access: SupporterAccess,
  artistId: Id<"artists">
): { entitled: boolean; routed: boolean } {
  return {
    entitled: access.entitled,
    routed: access.routedArtistIds.has(artistId),
  };
}

export async function routesEverStarted(
  ctx: QueryCtx | MutationCtx,
  artistId: Id<"artists">
): Promise<number> {
  const active = await ctx.db
    .query("supportRoutes")
    .withIndex("by_artist_active", (q) =>
      q.eq("artistId", artistId).eq("active", true)
    )
    .collect();
  const inactive = await ctx.db
    .query("supportRoutes")
    .withIndex("by_artist_active", (q) =>
      q.eq("artistId", artistId).eq("active", false)
    )
    .collect();
  return active.length + inactive.length;
}

export function isFoundingSlot(everStarted: number): boolean {
  return everStarted < FOUNDING_SUPPORTER_LIMIT;
}

/** A lapsed subscription stops current support. The rows stay so paying again restores them. */
export async function pauseSupportForProfile(
  ctx: MutationCtx,
  profileId: Id<"profiles">
): Promise<void> {
  const routes = await ctx.db
    .query("supportRoutes")
    .withIndex("by_profile_active", (q) =>
      q.eq("profileId", profileId).eq("active", true)
    )
    .collect();
  const now = Date.now();
  for (const route of routes) {
    await ctx.db.patch(route._id, {
      active: false,
      paused: true,
      endedAt: now,
    });
    await bumpSupporterCount(ctx, route.artistId, -1);
  }
}

export async function resumePausedSupport(
  ctx: MutationCtx,
  profileId: Id<"profiles">
): Promise<void> {
  const routes = await ctx.db
    .query("supportRoutes")
    .withIndex("by_profile_active", (q) =>
      q.eq("profileId", profileId).eq("active", false)
    )
    .collect();
  for (const route of routes) {
    if (route.paused !== true) {
      continue;
    }
    await ctx.db.patch(route._id, { active: true, paused: false });
    await bumpSupporterCount(ctx, route.artistId, 1);
  }
}
