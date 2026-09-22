import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    authUserId: v.id("users"),
    displayName: v.string(),
    genres: v.array(v.string()),
    timezone: v.optional(v.string()),
    isAdmin: v.boolean(),
    onboardingCompletedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_isAdmin", ["isAdmin"]),

  artists: defineTable({
    /** Set when a real login is attached (KIND-48). Seed acts may omit it. */
    profileId: v.optional(v.id("profiles")),
    name: v.string(),
    handle: v.string(),
    bio: v.string(),
    avatarFileId: v.optional(v.id("files")),
    verified: v.boolean(),
    hidden: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_handle", ["handle"])
    .index("by_hidden_createdAt", ["hidden", "createdAt"]),

  files: defineTable({
    storageId: v.id("_storage"),
    kind: v.union(
      v.literal("trackAudio"),
      v.literal("artwork"),
      v.literal("avatar"),
      v.literal("cover"),
      v.literal("updatePhoto"),
      v.literal("voiceNote")
    ),
    ownerProfileId: v.optional(v.id("profiles")),
    artistId: v.optional(v.id("artists")),
    contentType: v.string(),
    sizeBytes: v.number(),
    credit: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerProfileId"])
    .index("by_artist_kind", ["artistId", "kind"])
    .index("by_storageId", ["storageId"]),

  follows: defineTable({
    profileId: v.id("profiles"),
    artistId: v.id("artists"),
    createdAt: v.number(),
  })
    .index("by_profile_artist", ["profileId", "artistId"])
    .index("by_artist_createdAt", ["artistId", "createdAt"])
    .index("by_profile_createdAt", ["profileId", "createdAt"]),
});
