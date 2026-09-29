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
    coverFileId: v.optional(v.id("files")),
    verified: v.boolean(),
    hidden: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_handle", ["handle"])
    .index("by_profileId", ["profileId"])
    .index("by_artistName", ["name"])
    .index("by_hidden_createdAt", ["hidden", "createdAt"])
    .searchIndex("by_name", {
      searchField: "name",
      filterFields: ["hidden", "verified"],
    }),

  /**
   * A fan's ask to become an artist. Handle is derived from the display name.
   * Bio and note (why) come from the phone form. At most one pending row.
   */
  artistRequests: defineTable({
    profileId: v.id("profiles"),
    displayName: v.string(),
    handle: v.string(),
    bio: v.string(),
    note: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined")
    ),
    decidedByProfileId: v.optional(v.id("profiles")),
    decidedAt: v.optional(v.number()),
    declineReason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_profile_createdAt", ["profileId", "createdAt"])
    .index("by_status_createdAt", ["status", "createdAt"]),

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
    .index("by_storageId", ["storageId"])
    .index("by_sourceUrl", ["sourceUrl"]),

  follows: defineTable({
    profileId: v.id("profiles"),
    artistId: v.id("artists"),
    createdAt: v.number(),
  })
    .index("by_profile_artist", ["profileId", "artistId"])
    .index("by_artist_createdAt", ["artistId", "createdAt"])
    .index("by_profile_createdAt", ["profileId", "createdAt"]),

  tracks: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    audioFileId: v.id("files"),
    artworkFileId: v.optional(v.id("files")),
    visibility: v.union(v.literal("public"), v.literal("supporters")),
    state: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    publishAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    durationMs: v.number(),
    peaks: v.array(v.number()),
    embedding: v.optional(v.array(v.number())),
    embeddingText: v.optional(v.string()),
    tags: v.array(v.string()),
    description: v.optional(v.string()),
    genre: v.string(),
    hidden: v.boolean(),
    credit: v.optional(v.string()),
    /** Set when this track belongs to an EP or album. Singles leave it unset. */
    releaseId: v.optional(v.id("releases")),
    /** 0-based order inside the release. */
    position: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_artist_title", ["artistId", "title"])
    .index("by_artist_state_publishedAt", ["artistId", "state", "publishedAt"])
    .index("by_hidden_createdAt", ["hidden", "createdAt"])
    .index("by_state_publishAt", ["state", "publishAt"])
    .index("by_genre_publishedAt", ["genre", "publishedAt"])
    .index("by_visibility_publishedAt", ["visibility", "publishedAt"])
    .index("by_release_position", ["releaseId", "position"])
    .searchIndex("by_title", {
      searchField: "title",
      filterFields: ["state", "hidden", "visibility"],
    }),

  releases: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    type: v.union(v.literal("ep"), v.literal("album")),
    artworkFileId: v.id("files"),
    visibility: v.union(v.literal("public"), v.literal("supporters")),
    state: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published")
    ),
    publishAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    description: v.optional(v.string()),
    genre: v.string(),
    tags: v.array(v.string()),
    hidden: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_artist_state_publishedAt", ["artistId", "state", "publishedAt"])
    .index("by_state_publishAt", ["state", "publishAt"]),

  listenEvents: defineTable({
    profileId: v.id("profiles"),
    trackId: v.id("tracks"),
    artistId: v.id("artists"),
    startedAt: v.number(),
    msPlayed: v.number(),
    completed: v.boolean(),
    source: v.union(
      v.literal("feed"),
      v.literal("artist"),
      v.literal("playlist"),
      v.literal("library"),
      v.literal("mix"),
      v.literal("search"),
      v.literal("offline")
    ),
    clientEventId: v.string(),
  })
    .index("by_profile_clientEventId", ["profileId", "clientEventId"])
    .index("by_profile_startedAt", ["profileId", "startedAt"])
    .index("by_artist_startedAt", ["artistId", "startedAt"])
    .index("by_track_startedAt", ["trackId", "startedAt"]),

  /** One row per listener, patched while playing. Stale after ~60s. */
  presenceHeartbeats: defineTable({
    profileId: v.id("profiles"),
    artistId: v.id("artists"),
    trackId: v.id("tracks"),
    lastBeatAt: v.number(),
  })
    .index("by_profileId", ["profileId"])
    .index("by_artist_lastBeatAt", ["artistId", "lastBeatAt"])
    .index("by_lastBeatAt", ["lastBeatAt"]),

  libraryItems: defineTable({
    profileId: v.id("profiles"),
    trackId: v.id("tracks"),
    kind: v.union(v.literal("liked"), v.literal("saved")),
    createdAt: v.number(),
  })
    .index("by_profile_createdAt", ["profileId", "createdAt"])
    .index("by_profile_track", ["profileId", "trackId"]),

  playlists: defineTable({
    profileId: v.id("profiles"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_profile_createdAt", ["profileId", "createdAt"]),

  playlistEntries: defineTable({
    playlistId: v.id("playlists"),
    trackId: v.id("tracks"),
    position: v.number(),
    addedAt: v.number(),
  }).index("by_playlist_position", ["playlistId", "position"]),

  artistStats: defineTable({
    artistId: v.id("artists"),
    followerCount: v.number(),
    supporterCount: v.number(),
    followers7d: v.number(),
    distinctListeners7d: v.number(),
    plays7d: v.number(),
    risingScore: v.number(),
    firstPublishedAt: v.optional(v.number()),
    lastPublishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_artistId", ["artistId"])
    .index("by_risingScore", ["risingScore"]),

  updatePosts: defineTable({
    artistId: v.id("artists"),
    body: v.string(),
    photoFileId: v.optional(v.id("files")),
    voiceFileId: v.optional(v.id("files")),
    voiceDurationMs: v.optional(v.number()),
    voicePeaks: v.optional(v.array(v.number())),
    audience: v.union(v.literal("everyone"), v.literal("supporters")),
    hidden: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_artist_createdAt", ["artistId", "createdAt"])
    .index("by_audience_createdAt", ["audience", "createdAt"]),

  reactions: defineTable({
    profileId: v.id("profiles"),
    trackId: v.id("tracks"),
    emoji: v.string(),
    clientEventId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_profile_track", ["profileId", "trackId"])
    .index("by_track_createdAt", ["trackId", "createdAt"])
    .index("by_profile_clientEventId", ["profileId", "clientEventId"]),

  trackReactionCounts: defineTable({
    trackId: v.id("tracks"),
    counts: v.object({
      fire: v.number(),
      heart: v.number(),
      praise: v.number(),
      clap: v.number(),
      sparkle: v.number(),
    }),
    updatedAt: v.number(),
  }).index("by_trackId", ["trackId"]),

  supportRoutes: defineTable({
    profileId: v.id("profiles"),
    artistId: v.id("artists"),
    active: v.boolean(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    founding: v.boolean(),
    /** True after a thank-you. They leave the list and stay off it. */
    thanked: v.optional(v.boolean()),
  })
    .index("by_profile_active", ["profileId", "active"])
    .index("by_artist_active", ["artistId", "active"])
    .index("by_profile_artist", ["profileId", "artistId"])
    .index("by_artist_active_startedAt", ["artistId", "active", "startedAt"])
    .index("by_artist_active_founding", ["artistId", "active", "founding"])
    .index("by_artist_thank_queue", [
      "artistId",
      "active",
      "thanked",
      "founding",
      "startedAt",
    ]),

  entitlements: defineTable({
    profileId: v.id("profiles"),
    status: v.union(v.literal("active"), v.literal("expired")),
    productId: v.string(),
    priceTier: v.union(v.literal("4.99"), v.literal("9.99")),
    store: v.union(
      v.literal("app_store"),
      v.literal("play_store"),
      v.literal("test_store")
    ),
    rcAppUserId: v.string(),
    currentPeriodEnd: v.number(),
    willRenew: v.boolean(),
    lastVerifiedAt: v.number(),
    lastEventId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_profileId", ["profileId"])
    .index("by_rcAppUserId", ["rcAppUserId"])
    .index("by_status_currentPeriodEnd", ["status", "currentPeriodEnd"]),

  /** One row per RevenueCat event id so a retry does not apply twice. */
  rcWebhookEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    appliedAt: v.number(),
  }).index("by_eventId", ["eventId"]),

  demoEarnings: defineTable({
    period: v.string(),
    artistId: v.id("artists"),
    profileId: v.id("profiles"),
    amountCents: v.number(),
    currency: v.literal("USD"),
    tierCents: v.number(),
    routedCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_artist_period", ["artistId", "period"])
    .index("by_profile_period", ["profileId", "period"])
    .index("by_period", ["period"]),

  /** One total per artist per month, so the earnings page does not sum every supporter row. */
  earningMonths: defineTable({
    artistId: v.id("artists"),
    period: v.string(),
    amountCents: v.number(),
    storeFeeCents: v.number(),
    supporterCount: v.number(),
  }).index("by_artist_period", ["artistId", "period"]),

  thankYous: defineTable({
    artistId: v.id("artists"),
    profileId: v.id("profiles"),
    body: v.string(),
    sentAt: v.number(),
    readAt: v.optional(v.number()),
    pushSentAt: v.optional(v.number()),
  })
    .index("by_profile_sentAt", ["profileId", "sentAt"])
    .index("by_artist_sentAt", ["artistId", "sentAt"]),

  featuredSlots: defineTable({
    position: v.number(),
    targetType: v.union(v.literal("artist"), v.literal("track")),
    artistId: v.optional(v.id("artists")),
    trackId: v.optional(v.id("tracks")),
    activeFrom: v.number(),
    activeTo: v.optional(v.number()),
    createdByProfileId: v.optional(v.id("profiles")),
    note: v.optional(v.string()),
  })
    .index("by_position", ["position"])
    .index("by_activeFrom", ["activeFrom"]),

  /**
   * A saved mix. KIND-72 writes these from a prompt. The public page reads
   * them by slug and still locks any supporters-only track.
   */
  mixes: defineTable({
    profileId: v.id("profiles"),
    prompt: v.string(),
    name: v.string(),
    why: v.string(),
    trackIds: v.array(v.id("tracks")),
    slug: v.string(),
    createdAt: v.number(),
  })
    .index("by_profile_createdAt", ["profileId", "createdAt"])
    .index("by_slug", ["slug"]),
});
