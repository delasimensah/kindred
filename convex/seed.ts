import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

const ONBOARDING_ARTISTS = [
  {
    handle: "amaara",
    name: "Amaara Mensah",
    bio: "Afro-soul and R&B · Accra",
  },
  {
    handle: "kweku-darko",
    name: "Kweku Darko",
    bio: "Highlife · Kumasi",
  },
  {
    handle: "sela-okoro",
    name: "Sela Okoro",
    bio: "Amapiano · Lagos",
  },
  {
    handle: "tewa-nkrumah",
    name: "Téwá Nkrumah",
    bio: "Gospel · Accra",
  },
  {
    handle: "leye-ade",
    name: "Leye Ade",
    bio: "Afrobeats · Lagos",
  },
] as const;

/**
 * What: five fictional acts from the locked Kindred cast.
 * Where: we make the names (docs/design/kindred-ux-pilot-flow-prompts.md).
 * Rights: original fiction.
 * How: `npx convex run seed:onboardingArtists` (idempotent by handle).
 * Out: the full catalog and demo logins live in seedCatalog.ts.
 */
export const onboardingArtists = internalMutation({
  args: {},
  returns: v.object({ upserted: v.number() }),
  handler: async (ctx) => {
    let upserted = 0;
    for (const artist of ONBOARDING_ARTISTS) {
      const existing = await ctx.db
        .query("artists")
        .withIndex("by_handle", (q) => q.eq("handle", artist.handle))
        .unique();
      if (existing !== null) {
        await ctx.db.patch(existing._id, {
          name: artist.name,
          bio: artist.bio,
          verified: true,
          hidden: false,
        });
        upserted += 1;
        continue;
      }
      await ctx.db.insert("artists", {
        name: artist.name,
        handle: artist.handle,
        bio: artist.bio,
        verified: true,
        hidden: false,
        createdAt: Date.now(),
      });
      upserted += 1;
    }
    return { upserted };
  },
});

export const attachOnboardingAvatar = internalMutation({
  args: {
    handle: v.string(),
    storageId: v.id("_storage"),
    contentType: v.string(),
    sizeBytes: v.number(),
    credit: v.string(),
    sourceUrl: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (artist === null) {
      return null;
    }
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      kind: "avatar",
      artistId: artist._id,
      contentType: args.contentType,
      sizeBytes: args.sizeBytes,
      credit: args.credit,
      sourceUrl: args.sourceUrl,
      createdAt: Date.now(),
    });
    await ctx.db.patch(artist._id, { avatarFileId: fileId });
    return null;
  },
});
