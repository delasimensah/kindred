# Kindred — Convex system design

**Status:** Confirmed against live Convex (20 Sep 2026). Original approval 17 Sep 2026.
**Date:** 17 Sep 2026
**Companion to:** [system-design.md](./system-design.md) — that file is the _why_ and the build order; this file is the _how_ inside Convex.

Source of truth for product decisions is the studio practice pack lock (`00-locked-decisions.md`). Source of truth for what gets built is [product-requirements.md](./product-requirements.md). If this file disagrees with either, they win.

Official Convex docs beat anything here if they drift: [https://docs.convex.dev](https://docs.convex.dev).

Terms defined once, used throughout:

- **Query** — a read function. Cached, and it stays subscribed, so an open screen updates when the data changes.
- **Mutation** — a write function. It is a transaction: everything inside it lands, or none of it does.
- **Action** — a function that can call the outside world (the LLM, RevenueCat's API, the Expo Push API). Not transactional, no direct database access; it calls internal queries and mutations to touch data.
- **HTTP action** — a real URL on the Convex deployment that an outside service can send a request to.
- **Webhook** — that outside service sending the request. RevenueCat posts to our HTTP action when a subscription changes.
- **Index** — a pre-arranged ordering of a table so a query can jump straight to the rows it wants instead of reading the whole table.
- **Vector search** — turning text into a list of numbers that captures its meaning (an _embedding_), then finding rows whose numbers sit close together. It is how "rainy evening highlife" matches a track that never uses those words.
- **Entitlement** — the server's record that a person is currently a paying Supporter.
- **Idempotent** — running the same request twice produces one result, not two. Required for anything the offline outbox replays.

---

## 1. High-level picture and data flow

Four clients talk to **one** Convex deployment.

- **Mobile app (Expo)** — fans and supporters. Sign up, onboarding, listening, following, paying, routing, offline. The only fan account surface.
- **Artist Studio (Next.js on Vercel)** — verified artists. Upload, schedule, post, supporters, thank-yous, demo earnings.
- **Public web (same Next.js app)** — share URLs, signed-out browsing and public playback, locked exclusives with Get the app. No fan sign up or sign in.
- **Admin (route group in the same Next.js app)** — artist requests, verification, hide and remove, featured slots.

Plus one inbound caller that is not a person: **RevenueCat**, which posts subscription events to a Convex HTTP action.

Data flow in plain words:

1. A screen calls a query to read or a mutation to write.
2. The function's first lines establish who is calling and whether they may touch this row. There is no row-level security layer behind it to catch a mistake.
3. Writes go through mutations, so a status change and the row it depends on land together.
4. Anything slow or external — the LLM, RevenueCat's API, sending a push — goes in an action, usually started by a mutation or by the scheduler.
5. Screens using subscribed queries update on their own when the underlying rows change. That is how presence counts and reactions feel live without a separate realtime service.
6. Work that must happen later — a scheduled release, a held push, nightly rising scores, monthly demo earnings — goes on the Convex scheduler or a cron.

---

## 2. Roles and authorization rules

Roles are not a separate table. They are derived:

- Everyone signed in has a `profiles` row, linked to the Convex Auth user.
- **Artist** = that profile has a verified `artists` row pointing back at it.
- **Supporter** = that profile has an `entitlements` row with status `active` and `currentPeriodEnd` in the future.
- **Admin** = `profiles.isAdmin` is true. Set only by seed or by a one-off internal mutation run from the Convex dashboard. There is no public path to it.

**Every public query and mutation starts with the same three questions.** Write them as shared helpers in `convex/lib/auth.ts` so they cannot drift:

1. `requireProfile(ctx)` — who is calling? Throws if signed out.
2. `requireArtist(ctx)` / `requireAdmin(ctx)` — what role, if the function needs one?
3. `canAccessTrack(ctx, profileId, track)` / `canAccessPost(ctx, profileId, post)` — may they touch this specific row?

### The access helper that matters most

`canAccessTrack` answers the two-part question the whole product turns on:

- If the track is `public` and not hidden and its state is `published`, anyone may play it, including a signed-out visitor.
- If the track is `supporters`, the caller must have an **active entitlement** _and_ an **active support route to that track's artist**. Being a paying supporter of somebody else is not enough.
- The artist who owns the track may always access their own tracks, including drafts and scheduled ones.
- An admin may read metadata for moderation but does not get a special playback path.

`canAccessPost` is the same shape for `updatePosts`, using the post's `audience` field.

Both helpers return a small object rather than a boolean, so callers can render the right thing: `{ allowed: true }`, or `{ allowed: false, reason: "not-entitled" | "not-routed" | "hidden" | "unpublished" }`. The user interface uses `reason` to choose between a locked shell with a call to action and a plain not-found.

### Hard rules by role

**Signed out.** Read published public tracks (metadata and playback URL), Everyone posts, artist pages, and public mix pages. No writes, no heartbeats, no reactions.

**Fan (free, signed in).** All of the above, plus: follow and unfollow, react, record listen events, library items, private playlists, generate a mix over tracks they can access, send presence heartbeats, upload their own avatar, edit notification settings, and submit one artist request at a time. Explicitly refused: any supporters-only audio URL, any supporters-only post body or media, and any download URL.

**Supporter.** Everything a fan can do, plus supporters-only tracks and post bodies **from artists in their active route set only**, download URLs for tracks they can play, impact stats, and founding badges. Routing rules enforced server-side: maximum five active routes, the artist must already be followed, and the set may not be empty while the entitlement is active. `follows.remove` refuses if that artist is currently routed.

**Artist.** Everything a fan or supporter can do for their own listening. Scoped to their own `artistId` only: edit the artist profile, create and edit tracks, schedule and publish, create update posts, read their own supporter list, read their own demo earnings, and send thank-yous. An artist calling `artists.listSupporters` for another artist's id is refused. Write that test the day the table exists.

**Admin.** List and decide pending artist requests, verify and unverify artists, set `hidden` on tracks, posts, and artists, and manage featured slots. No access to private playlists, emails, listening history, or another person's entitlement details.

**Never trusted from the client.** Entitlement status, founding flags, demo-earnings amounts, rising scores, supporter counts, verification state, and the admin flag. All of those are written by the server or by seed only.

---

## 3. Tables, fields, and indexes

Names are suggestions; keep the relationships and the indexes.

### Accounts and roles

**`profiles`** — one per person.
Fields: `authUserId` (the Convex Auth user id), `displayName`, `avatarFileId` (optional), `genres` (array of strings from the fixed list), `timezone` (IANA string, used for quiet hours), `isAdmin` (boolean, default false), `artistId` (optional, set when an artist row is created), `createdAt`.
Indexes: `by_authUserId`, `by_isAdmin`.

**`artists`** — the public act.
Fields: `profileId`, `name`, `handle`, `bio`, `avatarFileId` (optional), `coverFileId` (optional), `verified` (boolean), `hidden` (boolean), `createdAt`.
Indexes: `by_profileId`, `by_handle`, `by_verified_createdAt`.
Search index `by_name` on `name`, filtering on `hidden` and `verified` — this is the exact-match half of search.

**`artistStats`** — derived counters, one row per artist, so no screen has to recount.
Fields: `artistId`, `followerCount`, `supporterCount`, `followers7d`, `distinctListeners7d`, `plays7d`, `risingScore`, `firstPublishedAt` (optional), `lastPublishedAt` (optional), `updatedAt`.
Indexes: `by_artistId`, `by_risingScore`.
`followerCount` and `supporterCount` are patched inside the follow and route mutations so they are always exact. The 7-day fields and `risingScore` are recomputed nightly by cron.

**`artistRequests`** — the fan's request to become an artist.
Fields: `profileId`, `displayName`, `handle`, `note` (optional), `status` (`pending` | `approved` | `declined`), `decidedByProfileId` (optional), `decidedAt` (optional), `declineReason` (optional), `createdAt`.
Indexes: `by_profile_createdAt`, `by_status_createdAt`.

### Catalog

**`tracks`**
Fields: `artistId`, `title`, `audioFileId`, `artworkFileId` (optional), `visibility` (`public` | `supporters`), `state` (`draft` | `scheduled` | `published`), `publishAt` (optional), `publishedAt` (optional), `durationMs`, `peaks` (array of 1000 numbers between 0 and 1), `embedding` (optional array of 1536 numbers), `embeddingText` (optional, what we embedded, so a re-embed is reproducible), `tags` (array of strings), `description` (optional), `genre`, `hidden` (boolean, admin), `credit` (optional attribution string for CC-BY seed audio), `releaseId` (optional, set when the track belongs to an EP or album), `position` (optional integer, 0-based order inside that release), `createdAt`.
Indexes: `by_artist_state_publishedAt`, `by_state_publishAt` (the safety net for missed scheduled publishes), `by_genre_publishedAt`, `by_visibility_publishedAt`, `by_release_position`.
Search index `by_title` on `title`, filtering on `state`, `hidden`, and `visibility`.
Vector index `by_embedding` on `embedding`, 1536 dimensions, filtering on `visibility`, `hidden`, and `state`.

Note on `peaks`: fixed at 1000 buckets no matter how long the track is, each a number from 0 to 1 rounded to three decimals. That is roughly 8 KB, comfortably inside a document, and more detail than any phone screen can draw.

Singles leave `releaseId` unset. A track in an EP or album stays a normal playable row (popular lists and queues unchanged) and also appears in order on the album page.

**`releases`** — an EP or album: one title, one cover, one visibility, one publish clock, and two or more member tracks.
Fields: `artistId`, `title`, `type` (`ep` | `album`), `artworkFileId`, `visibility` (`public` | `supporters`), `state` (`draft` | `scheduled` | `published`), `publishAt` (optional), `publishedAt` (optional), `description` (optional), `genre`, `tags`, `hidden`, `createdAt`.
Indexes: `by_artist_state_publishedAt`, `by_state_publishAt` (same schedule safety net shape as tracks).
Default labels: EP = 2–6 tracks; album = 7 or more. Publishing or scheduling a release flips the release row and every member track together.

**`updatePosts`**
Fields: `artistId`, `body`, `photoFileId` (optional), `voiceFileId` (optional), `voiceDurationMs` (optional), `audience` (`everyone` | `supporters`), `hidden`, `createdAt`.
Indexes: `by_artist_createdAt`, `by_audience_createdAt`.

**`files`** — metadata about a stored blob. Convex holds the bytes; this row holds what we need to know about them.
Fields: `storageId`, `kind` (`trackAudio` | `artwork` | `avatar` | `cover` | `updatePhoto` | `voiceNote`), `ownerProfileId` (optional), `artistId` (optional), `contentType`, `sizeBytes`, `credit` (optional, the CC-BY or Unsplash attribution), `sourceUrl` (optional, where the seed asset came from), `createdAt`.
Indexes: `by_owner`, `by_artist_kind`, `by_storageId`.

### Connection

**`follows`**
Fields: `profileId`, `artistId`, `createdAt`.
Indexes: `by_profile_artist` (the uniqueness check), `by_artist_createdAt` (push targeting and follower counts), `by_profile_createdAt` (the feed).

**`reactions`** — one reaction per profile per track; reacting again replaces it.
Fields: `profileId`, `trackId`, `emoji` (from the fixed set), `createdAt`.
Indexes: `by_profile_track`, `by_track_createdAt`.

**`trackReactionCounts`** — one row per track holding a small map of emoji to count, patched inside the reaction mutation. This exists so a track list does not scan the reactions table per row.
Fields: `trackId`, `counts` (object), `updatedAt`.
Index: `by_trackId`.

**`presenceHeartbeats`** — one row per profile, patched in place, never appended.
Fields: `profileId`, `artistId`, `trackId`, `lastBeatAt`.
Indexes: `by_profileId` (the upsert target), `by_artist_lastBeatAt` (the count query), `by_lastBeatAt` (the cleanup cron).

**`listenEvents`**
Fields: `profileId`, `trackId`, `artistId`, `startedAt`, `msPlayed`, `completed` (boolean), `source` (`feed` | `artist` | `playlist` | `library` | `mix` | `search` | `offline`), `clientEventId`.
Indexes: `by_artist_startedAt`, `by_profile_startedAt`, `by_track_startedAt`.

### Money

**`entitlements`** — one row per profile. Written by the server only.
Fields: `profileId`, `status` (`active` | `expired`), `productId`, `priceTier` (`4.99` | `9.99`), `store` (`app_store` | `play_store`), `rcAppUserId`, `currentPeriodEnd`, `willRenew` (boolean), `lastVerifiedAt`, `lastEventId` (optional), `updatedAt`.
Indexes: `by_profileId`, `by_rcAppUserId`, `by_status_currentPeriodEnd` (the expiry sweep cron).

**`rcWebhookEvents`** — the webhook's own idempotency log, so a retried delivery does not double-apply.
Fields: `eventId`, `type`, `rcAppUserId`, `payloadSummary`, `receivedAt`, `appliedAt` (optional).
Index: `by_eventId`.

**`supportRoutes`** — one row per routed artist per supporter.
Fields: `profileId`, `artistId`, `active` (boolean), `startedAt`, `endedAt` (optional), `founding` (boolean, decided once at creation).
Indexes: `by_profile_active`, `by_artist_active`, `by_profile_artist`.

**`demoEarnings`** — written forward only by the monthly cron, never recalculated.
Fields: `period` (for example `2026-10`), `artistId`, `profileId`, `amountCents`, `currency` (`USD`), `tierCents`, `routedCount`, `createdAt`.
Indexes: `by_artist_period`, `by_profile_period`, `by_period`.

### Personal collections

**`libraryItems`** — liked and saved tracks.
Fields: `profileId`, `trackId`, `kind` (`liked` | `saved`), `createdAt`.
Indexes: `by_profile_createdAt`, `by_profile_track`.

**`playlists`** — private to the owner.
Fields: `profileId`, `name`, `createdAt`.
Index: `by_profile_createdAt`.

**`playlistEntries`**
Fields: `playlistId`, `trackId`, `position`, `addedAt`.
Index: `by_playlist_position`.

**`mixes`**
Fields: `profileId`, `prompt`, `name`, `why`, `trackIds` (ordered array), `slug` (for the public URL), `createdAt`.
Indexes: `by_profile_createdAt`, `by_slug`.

### Messaging and delivery

**`thankYous`**
Fields: `artistId`, `profileId`, `body`, `sentAt`, `readAt` (optional), `pushSentAt` (optional).
Indexes: `by_profile_sentAt`, `by_artist_sentAt`.

**`pushTokens`**
Fields: `profileId`, `token` (the Expo push token), `platform` (`ios` | `android`), `deviceId`, `lastSeenAt`.
Indexes: `by_token`, `by_profile`.

**`notificationSettings`** — one row per profile.
Fields: `profileId`, `timezone`, `quietStartMinute` (default 1320, which is 22:00), `quietEndMinute` (default 420, which is 07:00), `releases`, `updates`, `thankYous`, `monthlyRecap` (booleans, all default true).
Index: `by_profile`.

**`artistMutes`**
Fields: `profileId`, `artistId`, `createdAt`.
Index: `by_profile_artist`.

**`pendingPushes`** — notifications held for quiet hours, or simply queued for the sender.
Fields: `profileId`, `kind` (`release` | `update` | `thankYou` | `milestone` | `recap` | `artistRequest`), `title`, `body`, `dataUrl` (the deep link), `notBefore`, `dedupeKey`, `sentAt` (optional), `failedAt` (optional), `error` (optional).
Indexes: `by_notBefore_sent`, `by_dedupeKey`.

### Admin and shared infrastructure

**`featuredSlots`**
Fields: `position` (integer), `targetType` (`artist` | `track`), `targetId`, `activeFrom`, `activeTo` (optional), `createdByProfileId`, `note` (optional).
Indexes: `by_position`, `by_activeFrom`.

**`outboxReceipts`** — the one table that makes offline replay safe.
Fields: `profileId`, `clientEventId`, `kind`, `resultRef` (optional, the id we created), `createdAt`.
Index: `by_profile_clientEventId`.
A cleanup cron deletes receipts older than 30 days. A phone that has been offline for longer than that is going to re-sync from scratch anyway.

**`aiRuns`** (optional, for debugging the demo)
Fields: `kind` (`mix` | `copilot` | `thankYou` | `embedding`), `profileId` (optional), `model`, `ok` (boolean), `durationMs`, `error` (optional), `createdAt`.
Index: `by_kind_createdAt`.

---

## 4. Status machines

### Artist request

States: `pending`, `approved`, `declined`.

- A profile with no request, or whose last request was `declined`, may create a `pending` one.
- A profile may have at most one `pending` request at a time. The create mutation checks and refuses.
- `pending` → `approved` (admin). Terminal for that profile. The same mutation creates or links the `artists` row using the requested display name and handle, sets `verified` to true, sets `profiles.artistId`, and creates the `artistStats` row. All in one transaction, so there is never an approved request with no artist.
- `pending` → `approved` (admin verifying a profile directly, without a request) is also allowed; it writes an approved request row for the audit trail so the admin list reads consistently.
- `pending` → `declined` (admin, with an optional reason). The requester may submit again.
- No other transition exists. An approved artist is not un-requested; an admin unverifies the artist row instead.

### Track publishing

States: `draft`, `scheduled`, `published`. Plus an independent `hidden` flag that admin controls.

- `draft` → `scheduled` when the artist sets a future `publishAt`. The mutation schedules the flip.
- `scheduled` → `draft` when the artist cancels the schedule. The scheduled job checks state before acting, so a cancelled job is a no-op rather than a bug.
- `draft` → `published` on publish now.
- `scheduled` → `published` by the scheduled job at `publishAt`. The job sets `publishedAt`, enqueues follower pushes, and (for a `public` track) triggers the embedding action.
- `published` is terminal in V1. There is no un-publish. Removing something from view is `hidden = true`, set by admin, which is a separate axis and does not rewrite the publish history.
- `visibility` (`public` or `supporters`) is also a separate axis. An artist may flip a supporters-only track to public later; that does not change its publish state, but it does trigger a re-embed so semantic search picks it up.

### Entitlement

States: no row, `active`, `expired`.

- no row → `active` on the first purchase, written by the webhook or the sync path.
- `active` → `active` on renewal. `currentPeriodEnd` moves forward, `lastVerifiedAt` updates.
- `active` → `active` with `willRenew = false` on cancellation. This matters: cancelling does **not** lock exclusives immediately. The person keeps access until `currentPeriodEnd`, which is what they paid for.
- `active` → `expired` when `currentPeriodEnd` passes. Driven by the RevenueCat expiration event, and backed up by a daily sweep cron so a missed webhook cannot leave someone entitled forever.
- `expired` → `active` on resubscribe.
- A billing-issue event is recorded but does not itself expire the row. The store retries; RevenueCat sends the expiration event if the retries fail.
- When a row goes `expired`, support routes are **not** deleted. They are left in place with `active = true` so that resubscribing restores the same set without the person re-picking. Access checks require the entitlement, so an expired person with routes still cannot open exclusives.

---

## 5. Function map, by domain

Names are suggestions. Anything not marked `internal` is callable from a client and therefore must start with the identity and authorization checks from section 2.

### Auth and profile

- `profiles.getMe` — query. Returns profile, artist row if any, entitlement summary, route set, and admin flag in one call, so the app shell does not make five round trips.
- `profiles.ensureProfile` — mutation, called once after first sign-in.
- `profiles.updateProfile` — mutation. Display name, avatar, timezone.
- `profiles.setGenres` — mutation. Onboarding, minimum two from the fixed list.
- `artistRequests.submit` — mutation. Refuses if a pending request exists or the profile is already an artist.
- `artistRequests.getMine` — query. Drives the pending / approved / declined status on **mobile** account settings.

### Catalog reads

- `artists.get` — query by id or handle. Returns the artist, stats, presence count, and whether the caller follows and routes them.
- `artists.listTracks` — paginated query. Returns published, non-hidden tracks. Supporters-only tracks appear with an `access` object so the user interface can render a locked shell, and with **no audio URL** for anyone not allowed.
- `tracks.get` — query. Same access shape.
- `tracks.getPlaybackSource` — query. The only place an audio URL comes from. See section 7.
- `posts.listForArtist` — query. Supporters-only posts return the shell fields only (author, date, "supporters only") unless the caller passes the access check; the body and media file ids are stripped server-side, not hidden client-side.
- `posts.listMine` — query (verified artist). Own updates with full body and media URLs for the Studio list.

### Feed and discovery

- `feed.listForMe` — paginated query. Update posts from followed artists plus new releases from followed artists, newest first, with locked shells where relevant.
- `discovery.listRising` — query. Featured slots first, in `position` order, then organic artists ordered by `artistStats.risingScore`, biased by the caller's onboarding genres.
- `discovery.listFeatured` — query. Used on web where the two lists render separately.

### Follow

- `follows.add` — mutation. Idempotent by `by_profile_artist`. Patches `artistStats.followerCount`. Accepts an optional `clientEventId` for outbox replay.
- `follows.remove` — mutation. **Refuses** if an active support route to that artist exists, returning the reason so the app can say "remove from support first."
- `follows.listMine` — query. Used by the routing picker.

### Entitlement and routing

- `entitlements.getMine` — query. Status, tier, period end, and last verified time. The offline check caches this on the device.
- `entitlements.syncFromRevenueCat` — action. Called by the app right after a purchase and on every cold start for a signed-in person. Calls RevenueCat's REST API with the secret key, then writes through `internal.entitlements.applyFromSource`. Section 6.
- `entitlements.applyFromSource` — internal mutation. The **only** writer of `entitlements`. Both the webhook and the sync path funnel through it.
- `entitlements.expireSweep` — internal mutation, run daily by cron. Flips `active` rows whose `currentPeriodEnd` has passed.
- `routes.listMine` — query.
- `routes.setRouteSet` — mutation. Takes the complete intended set of one to five artist ids plus an optional `clientEventId` and client timestamp. Validates entitlement is active, every artist is followed, the count is between one and five, and no duplicates. Deactivates routes not in the set, creates the new ones, and sets `founding` on each new route by reading `artistStats.supporterCount < 100` at that moment. Patches supporter counts and enqueues artist milestone pushes. Whole set in one transaction — never a partial route change.
- `routes.getImpact` — query. Per routed artist: since when, founding status, demo earnings to date, and the caller's own listening totals for that artist.

### Player helpers

Most player state is on the device. Three things need the server:

- `tracks.getPlaybackSource` — the entitlement-checked URL, above.
- `player.resolveQueueAccess` — query. Given a list of track ids, returns which are playable for this caller, so the queue can auto-skip locked tracks without asking per track.
- `presence.heartbeat` and `listen.record`, below.

### Offline replay targets

These are the mutations the outbox is allowed to call. Every one takes a `clientEventId` and checks `outboxReceipts` first.

- `follows.add`, `follows.remove`
- `reactions.set`
- `listen.record`
- `routes.setRouteSet`

Nothing else replays. Downloads, playlists, and library changes made offline are re-applied through the same normal mutations with a `clientEventId`; if you add one, add it to this list and to the receipts check.

- `outbox.replay` — mutation. Optional batch wrapper that takes an array of queued items and applies them in order inside one transaction, so a flaky connection does not leave half a batch applied.

### Presence

- `presence.heartbeat` — mutation. Upserts the caller's single row with the current artist, track, and time. Called every 20 seconds while audio is playing, including in the background. Not called while paused.
- `presence.countForArtist` — query. Counts rows on `by_artist_lastBeatAt` newer than 60 seconds. Subscribed, so the number moves on screen without polling.
- `presence.cleanup` — internal mutation, cron every 10 minutes. Deletes rows older than 10 minutes.

### Reactions and listening

- `reactions.set` — mutation. Replaces the caller's existing reaction on that track, patches `trackReactionCounts`, idempotent by `clientEventId`.
- `reactions.listForTrack` — query. Counts, not names.
- `listen.record` — mutation. Writes a `listenEvents` row once a play passes 30 seconds. Idempotent by `clientEventId`, which the phone generates when the play starts, so an offline replay of the same play does not double-count.

### Search and mix

- `search.exact` — query. Runs the `tracks.by_title` and `artists.by_name` search indexes, artists first then tracks, filtered to published and not hidden, then access-filtered.
- `search.semantic` — action. Embeds the caller's text, runs the vector index, loads the candidate documents through an internal query, drops anything the caller cannot access, and returns the remainder below the exact results.
- `mix.generate` — action. Section 8.
- `mix.get` — query by id or slug. A mix page is public; individual tracks inside it still go through the access check when played.
- `mix.listMine` — query.

### Studio: upload, publish, posts

- `files.generateUploadUrl` — mutation. Role-checked: audio upload requires a verified artist.
- `files.register` — mutation. Writes the `files` row after the upload completes, with kind, size, content type, and credit.
- `tracks.createDraft` — mutation (artist). Takes the audio file id, artwork file id, title, duration, and the **peaks array generated in the browser**. Refuses a peaks array that is not 1000 entries.
- `tracks.update` — mutation (artist, own tracks only). Title, description, tags, genre, visibility.
- `tracks.publishNow` — mutation. Sets `published` and `publishedAt`, enqueues follower pushes, schedules the embedding action.
- `tracks.schedule` — mutation. Sets `scheduled` and `publishAt`, and calls `ctx.scheduler.runAt` for the flip.
- `tracks.cancelSchedule` — mutation. Back to `draft`.
- `tracks.publishScheduled` — internal mutation, the scheduler's target. Checks the state is still `scheduled` before acting.
- `tracks.embed` — internal action. Builds the embedding text from title, artist name, genre, tags, and description; calls the embedding API; patches `embedding` and `embeddingText`.
- `ai.suggestReleaseCopy` — action (artist). Returns a structured draft: suggested tags, a description, and a short release note. Stores nothing on the track. The artist edits and confirms; only `tracks.update` writes.
- `posts.create` — mutation (artist). Text plus optional photo or voice note file id, with the audience. Voice peaks are 48 buckets from the browser. Follower pushes land with KIND-62.
- `posts.update` / `posts.remove` — mutations (artist, own posts). Can replace or clear photo/voice.
- `posts.getMine` — query (verified artist). One own post for the Studio editor.
- `posts.generateUploadUrl` / `posts.registerPhoto` / `posts.registerVoice` — mutations (verified artist) for update media.

### Studio: supporters, thank-yous, earnings

- `artists.listSupporters` — paginated query (artist, own artist id only). Who routes to them, since when, founding status.
- `ai.rankFansToThank` — action (artist). The **ranking is deterministic** from support routes and listen events: longest-routed first, then most listening minutes in the last 30 days, then founding status as a tiebreak. The LLM writes only the one-line draft message. Returns a shortlist of candidates each with a draft; nothing is sent.
- `thankYous.send` — mutation (artist). Takes the final edited body. Writes the row and enqueues the push.
- `thankYous.listMine` — query (fan side). The thank-you card.
- `thankYous.markRead` — mutation.
- `earnings.listForArtist` — query (artist, own only). Monthly demo earnings rows.
- `earnings.computeMonth` — internal mutation, monthly cron. Section 9.

### Admin

- `admin.listArtistRequests` — query. Pending first.
- `admin.decideArtistRequest` — mutation. Approve (creates or links the artist, verifies, sets `profiles.artistId`, creates `artistStats`, enqueues an approval push) or decline with a reason.
- `admin.setArtistVerified` — mutation.
- `admin.setHidden` — mutation. Works on a track, post, or artist.
- `admin.listCatalog` — paginated query.
- `admin.setFeaturedSlots` — mutation. Replaces the whole ordered list in one transaction.

### Push

- `push.registerToken` — mutation. Upsert by token; refresh `lastSeenAt` on every app start so dead tokens are visible.
- `push.updateSettings` — mutation. Quiet hours, timezone, per-type toggles.
- `push.setArtistMute` — mutation.
- `push.enqueue` — internal mutation. The single entry point for creating a notification. Applies per-artist mute and the per-type toggle, then computes `notBefore` from the recipient's quiet hours, then writes a `pendingPushes` row. Section 9.
- `push.deliverDue` — internal action, cron every minute. Picks up rows whose `notBefore` has passed and `sentAt` is empty, looks up the recipient's tokens, sends via the Expo Push API, and records the result.

### Internal only

Everything a cron or an action calls is an `internalMutation`, `internalQuery`, or `internalAction`, so a client cannot invoke it directly. In particular: `entitlements.applyFromSource`, `tracks.publishScheduled`, `tracks.embed`, `push.enqueue`, `push.deliverDue`, `earnings.computeMonth`, `discovery.recomputeRising`, and `presence.cleanup`.

---

## 6. RevenueCat: the webhook and the restore sync path

Two paths write the entitlement. Both end in the same internal mutation, so there is exactly one place where a row is created.

### The webhook path

- Convex exposes an HTTP action at `POST /revenuecat/webhook`, registered in `convex/http.ts`.
- RevenueCat is configured to send an `Authorization` header with a shared secret. The handler compares it to `REVENUECAT_WEBHOOK_SECRET` from the Convex environment and returns 401 on a mismatch, before reading the body.
- The handler reads the event id and checks `rcWebhookEvents.by_eventId`. If the event was already applied, it returns 200 immediately. RevenueCat retries on non-200, so a duplicate delivery must be cheap and harmless.
- The `app_user_id` on the event is the **Convex profile id**, because the mobile app configures the RevenueCat SDK with that id at sign-in. No email matching, no guessing.
- Handled event types and what they do:
  - `INITIAL_PURCHASE`, `RENEWAL`, `UNCANCELLATION`, `PRODUCT_CHANGE` → set `status: active`, update `productId`, `priceTier`, `currentPeriodEnd`, `willRenew: true`, `lastVerifiedAt`.
  - `CANCELLATION` → keep `status: active`, set `willRenew: false`. Access continues until the period end they paid for.
  - `EXPIRATION` → set `status: expired`.
  - `BILLING_ISSUE` → record it, change nothing. The store retries; if it fails, an expiration event follows.
  - `TRANSFER` → move the entitlement to the new `app_user_id` and expire the old row.
  - Anything else → log and return 200.
- The handler then calls `internal.entitlements.applyFromSource` and writes `appliedAt` on the event row in the same flow.

### The restore and sync path

Webhooks lag, and a reinstall has no webhook at all. So the client also asks the server to go and check.

- After a successful purchase, and on every cold start for a signed-in person, the app calls `entitlements.syncFromRevenueCat`.
- That action calls RevenueCat's REST API server-side using `REVENUECAT_SECRET_KEY` from the Convex environment, reads the subscriber's entitlements, and calls the same `applyFromSource` mutation.
- **The client's own `CustomerInfo` is never sent to the server as truth.** The app may use it locally to decide what to render immediately, but the row is written from what the server fetched.
- Restore purchases on the phone is the RevenueCat SDK call followed by this same sync, then a refetch of `profiles.getMe`.
- The paywall shows a brief "confirming your support" state while this runs, rather than a failure, because the honest answer for a few seconds is "we are checking."

### Why `applyFromSource` is one mutation

It compares what it is given against the current row and only patches when something actually changed, so a webhook and a sync arriving a second apart produce one write and one final state. It also records `lastEventId` so a late, out-of-order webhook cannot move `currentPeriodEnd` backwards.

---

## 7. File storage and the playable URL check

**What Convex gives us.** A storage id, and `ctx.storage.getUrl(storageId)`, which returns a long unguessable URL. The honest limitation, stated plainly: that URL is **not** tied to a signed-in person. Anyone holding it can fetch the bytes.

**What we do about it in V1.**

- No list query ever returns an audio URL. `artists.listTracks`, `feed.listForMe`, `search.*`, and `mix.get` return metadata, artwork URLs, and an `access` object — never the audio.
- `tracks.getPlaybackSource` is the only function that returns an audio URL. It runs `canAccessTrack` first and throws with a reason if the answer is no. The app calls it for the track it is about to play, and again when the queue advances.
- Artwork, avatars, covers, and update photos are public by nature and may appear in lists.
- A **voice note on a supporters-only post** is treated like exclusive audio: no URL in the list, fetched through `posts.getVoiceSource` after the access check.
- Public web pages render metadata and artwork only. Audio URLs are fetched client-side after sign-in, so nothing exclusive lands in server-rendered HTML that a crawler could read.
- Downloads use the same function. `tracks.getPlaybackSource` with a `forDownload` flag runs the same check and additionally requires an active entitlement even for public tracks, because downloads are a supporter feature.

**What we accept.** A determined supporter could copy a URL out of their own network traffic and share it. That is the documented V1 position. It is a membership check, not **DRM** — copy-protection that encrypts the file so only a special player can open it. The lock rules out DRM for V1.

**The later hardening, already scoped.** Move audio bytes to object storage (R2 or similar) and return short-lived signed links from the same `getPlaybackSource` function. Every caller already goes through that one function, so the change is one function body plus a migration of the bytes. No product rule changes.

**Upload flow.** `files.generateUploadUrl` (role-checked) → the browser or app POSTs the bytes → `files.register` writes the metadata row → the domain mutation (`tracks.createDraft`, `posts.create`, `profiles.updateProfile`) attaches the file id. Peaks come with `tracks.createDraft` from the browser decode, so the server never touches the audio bytes.

---

## 8. Vector search and mix retrieval

### The embedding

- One embedding per track, 1536 numbers, from OpenAI `text-embedding-3-small` as the V1 default. That model is the default because a single account and key covers both embeddings and the chat features; it can be swapped at the vector spike if something fits better.
- The embedded text is assembled from title, artist name, genre, tags, and description, and stored in `embeddingText` so a re-embed is reproducible and a diff is visible.
- Written by `internal.tracks.embed`, an action, triggered on publish, on a metadata edit that changes the embedded text, and on visibility change. The seed pipeline embeds all seed tracks in one batch.
- **Changing the embedding model means re-embedding everything.** Decide it at the spike, not in November.

### Semantic search

`search.semantic` is an action, because vector search only runs in actions.

1. Embed the user's text.
2. Run `ctx.vectorSearch("tracks", "by_embedding", { vector, limit: 40, filter: published and not hidden })`.
3. Load the matching documents through an internal query — vector search returns ids and scores, not documents.
4. Drop anything `canAccessTrack` refuses, and drop anything already returned by `search.exact`.
5. Return the top results below the exact matches, as the lock requires.

### Mix generation

`mix.generate` is an action and follows retrieve-then-rank-then-explain. The LLM never picks the tracks.

1. Embed the user's prompt.
2. Vector search for a generous candidate pool, around 60 tracks, filtered to published and not hidden.
3. Load the documents and drop everything the caller cannot access. This is the step that makes the lock's rule true: a mix can only contain tracks this person can actually play.
4. Rank deterministically, in the order the lock specifies: tracks from **routed** artists first, then from **followed** artists, then general catalog, and within each band by vector similarity. Cap at one or two tracks per artist so a mix is not one artist's album.
5. Take the top 15.
6. Ask the LLM for two short things: a name for the mix and a one-line why, given the prompt and the resulting track and artist names. If that call fails or times out, fall back to a template ("Fifteen tracks leaning toward _{prompt}_, mostly from artists you back") and carry on. A failed LLM call must never fail the mix.
7. Write the `mixes` row with a slug and return it.

If the caller has zero playable tracks the mix is empty — which, per the lock, should never happen for a seeded demo account.

---

## 9. Scheduler, crons, and quiet-hours push filtering

### Scheduled publish

- `tracks.schedule` calls `ctx.scheduler.runAt(publishAt, internal.tracks.publishScheduled, { trackId })`.
- `publishScheduled` re-reads the track and does nothing unless the state is still `scheduled` and `publishAt` has arrived. That makes a cancelled schedule a harmless no-op.
- On success it sets `published` and `publishedAt`, calls `push.enqueue` for every follower, and schedules `tracks.embed`.
- **Safety net cron, hourly.** Find tracks where the state is `scheduled` and `publishAt` is in the past, and publish them. This covers the case where a scheduled job was lost across a deploy. Without it, a release silently never happens, which is exactly the "a track that was published on schedule must not un-publish" reliability risk.

### The cron list

- **Every minute** — `push.deliverDue`. Send `pendingPushes` rows whose `notBefore` has passed.
- **Every 10 minutes** — `presence.cleanup`. Delete heartbeats older than 10 minutes.
- **Hourly** — the scheduled-publish safety net.
- **Daily** — `entitlements.expireSweep`. Flip active rows whose `currentPeriodEnd` has passed, in case an expiration webhook was missed.
- **Nightly** — `discovery.recomputeRising`. Recompute the 7-day fields and `risingScore` on `artistStats` using the formula in section 8 of the system design doc.
- **Daily** — `outboxReceipts` cleanup, deleting receipts older than 30 days.
- **Monthly, on the 1st** — `earnings.computeMonth`. For every profile with an active entitlement, take 70% of their tier price (store-fee stand-in), split that pool equally across their active routes, and write one `demoEarnings` row per routed artist for the previous period. Written forward only; changing routes never rewrites a past month.

### Quiet hours and mute, applied server-side

`push.enqueue` is the only way a notification gets created, and it applies the filters in this order:

1. Is the recipient muting this artist? If yes, stop. Nothing is created.
2. Is the per-type toggle off in their notification settings? If yes, stop.
3. Compute the recipient's local time from `notificationSettings.timezone`.
4. If that local time is inside the quiet window (default 22:00 to 07:00), set `notBefore` to the next end-of-window instant. Otherwise `notBefore` is now.
5. For the monthly recap only, a quiet-hours collision means **drop it** instead of holding it. A day-late recap is noise.
6. Write the `pendingPushes` row with a `dedupeKey` (for example `release:{trackId}:{profileId}`) so the same release cannot be queued twice by a retry.

`push.deliverDue` then looks up the recipient's tokens, sends through the Expo Push API, and records `sentAt` or `failedAt`. A token that the Expo API reports as unregistered is deleted, so dead devices stop costing sends.

**Identity does not travel into scheduled functions.** Anything the scheduler runs receives the ids it needs as arguments. Never assume `getUserIdentity` works inside a cron.

---

## 10. Seed pipeline

The seed makes the demo rich. It does **not** replace a required role path — a stranger must still be able to sign up, request artist access, get approved, and publish.

### Assets in the repo

- `seed/assets/audio` — 40 CC0 or CC-BY files, three to four minutes each, roughly 140 MB total.
- `seed/assets/images` — about 60 Unsplash or Pexels images, or simple originals, roughly 12 MB total.
- `seed/manifest.json` — for every asset: the file name, the source URL, the licence, and the required credit string. This file is what the store-review rights note is generated from.

### The local peaks script

`seed/scripts/generate-peaks.ts` runs in Node before seeding. For each audio file it decodes, downsamples to **1000 buckets** of amplitude between 0 and 1 rounded to three decimals, reads the duration, and writes both into `seed/peaks.json`. Exactly the same array shape the browser produces at artist upload, so the Skia scrubber has one format to handle and never decodes audio on the phone.

### What the seed creates

Run as a Convex internal mutation plus a companion action (the action does the uploads and the embeddings; the mutation does the rows).

1. **Profiles and demo logins.** Four named demo accounts — a free fan, a supporter, an artist, and an **admin** — plus around 40 synthetic fans with real-looking names. Never a visible name like "test user."
2. **Artists.** 12 verified artists, 3 of them heroes. Fictional names and branding.
3. **Files.** Upload every audio and image asset to Convex storage and write `files` rows carrying `credit` and `sourceUrl` from the manifest, so the app can render attribution where the licence needs it.
4. **Tracks.** About 500 rows. The heroes get deep catalogs with a believable mix of public and supporters-only, including a couple of `scheduled` ones so the studio's scheduled state is visible. Filler rows reuse the 40 audio files, which keeps the storage budget under 200 MB while still proving long-list performance.
5. **Peaks.** Written from `peaks.json` onto every track at insert time.
6. **Embeddings.** One batched action run over all tracks after insert.
7. **Update posts.** History for the heroes, mixed Everyone and Supporters only. One post carries a photo copied from that artist's Unsplash artwork. One post carries a spoken voice note: a public-domain LibriVox reading of the Gettysburg Address, so the clip is speech and not a music track. That format is visible without waiting for the Safari recording spike.
8. **Follows, listen events, and reactions.** Synthetic, and deliberately dated **inside the 7-day rising window** so discovery is not empty on day one and the rising score has something to rank.
9. **Entitlement and routes for the supporter demo login.** Written directly by seed, which is the one place a client-free write is allowed, with a note in the code that this bypasses RevenueCat on purpose.
10. **Demo earnings.** Two or three past months so the artist earnings screen has a history, labelled as demo.
11. **Thank-yous.** One or two so the fan-side card is demonstrable.
12. **Featured slots.** Two, so the discovery screen shows both bands.
13. **One pending artist request** from a synthetic fan, so the admin queue is not empty when you open it.

### Demo logins

Written into the repo's `ACCESS-LIST.md` next to the 90-second demo script, generated from the seed arguments so the file and the database cannot drift:

- Free fan
- Supporter, already entitled and routed to two artists
- Artist, one of the heroes, with a catalog and supporters
- **Admin**, which is the only way the admin flag is ever set outside a one-off dashboard mutation

### Before running it

Do the arithmetic in section 8 of [system-design.md](./system-design.md) against the current Convex plan's storage and bandwidth allowances. The lock says do not seed blindly, and audio is the reason.

---

## 11. What is not in Convex

Three things live on the device and the server never sees them directly.

**The playback queue.** What is up next, shuffle, repeat, and the current position are per-device session state, held in Zustand in memory with a small snapshot persisted locally so a crash does not lose the queue. The lock says queue state need not sync across devices in V1. The server's only involvement is `player.resolveQueueAccess`, which says which tracks are playable so the queue can skip locked ones.

**The outbox.** A table in the device's `expo-sqlite` database: one row per queued write, with a client-generated id, the target mutation name, the arguments, a state (queued, sending, failed, done), an attempt count, and a created timestamp. It is chosen over AsyncStorage because individual rows change state independently and AsyncStorage would rewrite the whole blob for every change, which can silently lose entries. The server sees only the idempotent mutations it replays and the `outboxReceipts` rows that stop a replay landing twice.

**Downloaded files and their metadata.** The audio bytes live on the device filesystem via `expo-file-system`. What is downloaded, its size, its state, and the entitlement expiry captured at download time live in the same SQLite database as the outbox, so "what is on disk" and "what is queued" are one store. Offline playback of an exclusive is allowed while the current time is before the cached `currentPeriodEnd` **and** less than seven days have passed since `lastVerifiedAt`. Convex holds no `downloads` table in V1; nothing on the server needs to know which device has which file.

Also not in Convex, and staying that way: any second backend, a separate queue product, a separate realtime service, a separate search service, and any client-side write to entitlement, founding flags, demo earnings, rising scores, supporter counts, verification, or the admin flag.

---

## 12. Suggested build order inside Convex

Mirrors the phases in section 10 of [system-design.md](./system-design.md), expressed as backend work.

1. Convex Auth Password, `profiles`, `profiles.getMe`, and the three authorization helpers.
2. `artists`, `tracks`, `files`, `follows`, and the seed pipeline including peaks.
3. `tracks.getPlaybackSource` with `canAccessTrack` stubbed to public-only, plus `player.resolveQueueAccess`.
4. `updatePosts`, `feed.listForMe`, `reactions`, `presenceHeartbeats`, `listenEvents`.
5. `pushTokens`, `notificationSettings`, `artistMutes`, `pendingPushes`, `push.enqueue`, `push.deliverDue`.
6. `entitlements`, the RevenueCat HTTP action, `syncFromRevenueCat`, `supportRoutes`, and the **real** `canAccessTrack`. Write the cross-artist refusal test in this step, not later.
7. `outboxReceipts` and the `clientEventId` argument on every replay target.
8. Search index, vector index, `tracks.embed`, `search.exact`, `search.semantic`, `mix.generate`.
9. Studio writes: upload URLs, `tracks.createDraft`, publish and schedule, the scheduler target and its safety-net cron, `posts.create`, `ai.suggestReleaseCopy`.
10. `artists.listSupporters`, `ai.rankFansToThank`, `thankYous`, `demoEarnings` and its monthly cron.
11. `artistRequests`, `admin.*`, `featuredSlots`, `discovery.recomputeRising`.
12. Public web read paths, confirming no exclusive URL is ever server-rendered.
