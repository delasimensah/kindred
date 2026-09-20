# Kindred — system design

**Status:** Confirmed against live Convex (20 Sep 2026). Original approval 17 Sep 2026.
**Date:** 17 Sep 2026
**Owner:** Delasi Mensah (solo product, portfolio flagship)
**Companion:** [convex-design.md](./convex-design.md) — the table-by-table, function-by-function version of this plan.
**Live backend:** Convex project `kindred` (team `dm-studios`), thin Auth + `profiles` stub only until schema growth tickets.

---

## 1. Why this document exists

The product is locked and the requirements are written. This document is the architecture pass that sits between them and the first ticket.

- Product lock: studio practice pack `00-locked-decisions.md` — what was decided.
- Requirements: [product-requirements.md](./product-requirements.md) — what gets built.
- This file: how it is built, and in what order.

Kindred is a portfolio product, so there is no invoice gating this step. The rigour is the same as a paid job on purpose: the case study only holds up if the architecture holds up.

The bar for this document: a junior engineer (or an agent) could take it plus the Convex companion and start building without inventing product decisions. If this file and the lock disagree, **the lock wins** and this file gets corrected.

Two words used constantly below, defined once:

- **Entitlement** — the server's record that a person is currently a paying Supporter. It is a row in Convex, written only from RevenueCat's server-side truth. The phone never decides it.
- **Spike** — a short, timeboxed experiment done before the real ticket, whose only output is a written "works / blocked / cut to Later" note. Spikes exist so we find out that something is impossible in a day, not in December.

---

## 2. Functional requirements (already written)

Not repeated here. The 20 acceptance-ready journeys, the four roles, the screen list, and the out-of-scope list all live in [product-requirements.md](./product-requirements.md) sections 2, 3, and 9.

What matters for architecture, pulled forward in one line each:

- Four roles: fan (free), supporter (paying), artist (verified uploader), studio admin.
- Mobile (Expo) is the fan and supporter surface. Web (Next.js) is three things only: Artist Studio, public share pages, and a light fan player.
- Purchases are mobile-only. Uploads are web-only. Both rules are hard.
- Money is one monthly subscription routed to one to five followed artists, equal split, and that routing is the single gate for exclusive access.
- Everything paid is enforced on the server. A hidden button is not access control.

---

## 3. Non-functional requirements, prioritized for Kindred

The big ones are not scale. Kindred is a portfolio app with a small real audience. The big ones are **who can see what** and **whether the paid state is right**.

**Highest — privacy of supporter lists and personal listening data.**
An artist sees their own supporters and nobody else's. A supporter's routing choices, listening history, and email are private to them. Presence is deliberately a *number*, never a list of names, so "who is listening to me right now" cannot leak. These are enforced inside Convex functions, not by hiding user-interface elements.

**Highest — entitlement consistency.**
Supporter status must be right in three awkward moments: right after purchase (the webhook may lag), after a reinstall (restore purchases), and after cancellation (exclusives must re-lock). One rule closes all three: the phone reports nothing, the server reads RevenueCat, the server writes the row, and every exclusive query re-reads that row. See section 6 of the Convex companion.

**High — reliability of anything money-adjacent.**
A saved route set must survive reinstall. A founding badge, once earned, is never recalculated. A demo-earnings month, once written, is never rewritten when the supporter changes routes. Published tracks never silently un-publish.

**High — latency for play and scrub.**
Pressing play should start audio immediately, and dragging the waveform should move the audio in lockstep. Two design consequences: the waveform draws from a **precomputed peaks array** stored on the track document (never decoded on the phone), and the audio URL is fetched once per track, not re-resolved on every scrub frame.

**Medium — realtime, but only two things.**
Reactions should appear live. Presence should feel live. Both ride Convex's normal subscribed queries. There is no separate realtime service and no synced listening.

**Medium — presence is explicitly approximate.**
An artist's listener count may be up to about a minute out of date. That is a product decision, not a bug, and it is what lets the heartbeat write volume stay low. Exact numbers in section 8.

**Medium — offline, supporters only, custom.**
Convex is online-first. There is no "Convex offline mode" to switch on. Offline in Kindred is client work: downloaded audio files on disk, a local database for what is downloaded, and an **outbox** (a queue of writes the phone could not send yet, stored on the device and replayed when the network comes back). Free fans stream online only.

**Lower — scale.**
Twelve seeded artists, three with deep catalogs, a few hundred filler catalog rows for list performance, and a small real audience. Roughly 1 to 100 queries per second. Do not design for millions.

**Lower — availability.**
Best effort. One developer, one Convex deployment, one Vercel project. Store review windows and real-device test days shape the schedule far more than uptime does.

**Watch item, not a requirement — cost.**
Audio streams out of Convex file storage. **Egress** means the bytes leaving the server and travelling to a listener's phone; audio is heavy, so this is the one bill that can grow quietly. Estimates and the escape hatch are in section 8.

**Resource estimation.** The checklist marks this optional. For Kindred it is worth ten lines, because audio makes it real — see section 8.

---

## 4. Backend choice: Convex, and the four parts that are actually hard

**The choice.** Convex is the whole backend: database, auth tables, file storage, queries, mutations, actions, HTTP actions, scheduled functions, full-text search index, and vector index. There is no second backend, no separate queue product, no separate search product, no separate realtime product.

**Why.** Every capability Kindred needs beyond plain reads and writes — background jobs for scheduled release, an HTTP endpoint for the RevenueCat webhook, semantic search, file storage, live-updating queries — is already inside Convex. Adding Supabase or a separate worker would mean two sets of credentials, two permission models, and two places to get the entitlement check wrong. Ridgeway already proved the Convex permission pattern works; Kindred reuses it and adds consumer-scale reads.

**Auth.** Convex Auth, Password provider only. No Sign in with Apple, no Google. Those stay out until a separate audit re-locks them, per section 10 of the lock. Do not add them mid-build because a store review screen suggests it.

### The hard parts, in engineer language

**1. Entitlement is server-only, and it is the gate for everything paid.**
The `entitlements` row for a profile is written by exactly two code paths: the RevenueCat **webhook** (an HTTP request RevenueCat sends to our server when a subscription changes) and a server-side sync that calls RevenueCat's API directly when the webhook has not arrived yet. No client mutation writes it. Every query that returns exclusive audio, exclusive post bodies, or a downloadable file re-reads that row plus the routing rows. The failure mode to test for is not "the paywall looks wrong"; it is "a non-supporter got a playable URL."

**2. Exclusives are per route, not per subscription.**
Paying does not unlock the platform. It unlocks the one to five artists in that person's route set. So the access check is always two questions, never one: is this person entitled *right now*, and is *this artist* in their active route set? That check appears in track playback, post bodies, download requests, mix building, search results, and the public web pages. Write it once as a shared helper and call it everywhere. If it gets copy-pasted with a variation, that variation is the bug.

**3. Offline is a small distributed system on the phone.**
Downloads are easy. The outbox is not. The phone will replay follows, reactions, listen events, and route changes that were queued while offline, and it will sometimes replay them twice (app killed mid-flush, flaky network, retry storm). The server must be **idempotent** — running the same request twice produces one result, not two. Kindred does this with a client-generated id on every queued write and a receipts table on the server that refuses to process the same id twice. Route changes are the sharp edge: two conflicting offline route edits must resolve to one final set, not a merge.

**4. Audio storage and egress.**
Track bytes live in Convex file storage for V1. The honest limitation: a Convex storage URL is long and unguessable but it is not tied to a signed-in person — anyone holding the URL can fetch the bytes. So Kindred never puts audio URLs in list responses, in public HTML, or in anything crawlable. A URL is handed out only by a single function that runs the entitlement check first, and only for the track about to play. If egress cost or storage limits start to hurt the demo, moving bytes to object storage (R2 or similar) with short-lived signed links is a later infrastructure ticket that changes the URL and nothing about the product rules.

---

## 5. Amazon-shaped map (literacy, not the stack)

Kindred does not run on Amazon Web Services. The map stays in the design so the experience travels to a job that does.

- **Identity** — Amazon Cognito → **Convex Auth**, Password provider.
- **Database** — Amazon RDS (Postgres) → **Convex tables with indexes**. A document database, not SQL. You design indexes for the queries you actually run.
- **Object storage** — Amazon S3 → **Convex file storage** for audio, artwork, avatars, update photos, voice notes.
- **Content delivery for media** — Amazon CloudFront → nothing in V1. Audio is served straight from Convex storage. This is the named cost risk, and R2 plus a CDN is the documented later move.
- **Static site and web hosting** — Amazon CloudFront plus S3 → **Vercel**, hosting the Next.js app and the two link-verification files (`apple-app-site-association` and Digital Asset Links) that make universal links work.
- **Queue and background work** — Amazon SQS plus Lambda → **Convex scheduled functions and crons**. Scheduled publish, quiet-hours push delivery, nightly rising-artist scoring, and monthly demo earnings all run here. No separate queue product on day one.
- **Inbound webhook endpoint** — Amazon API Gateway plus Lambda → a **Convex HTTP action**, a real URL on the Convex deployment that RevenueCat can POST to.
- **Search** — Amazon OpenSearch → **Convex full-text search index** for exact title and artist matching, plus **Convex vector index** for semantic results. **Vector search** means: turn text into a list of numbers that captures its meaning (an *embedding*), store it, and find tracks whose numbers sit close to the numbers for what the user typed. That is how "rainy evening highlife" can match a track that never uses those words.
- **Push notifications** — Amazon SNS or Pinpoint → **Expo Push API**, with device tokens stored in Convex and quiet hours applied server-side before anything is sent.
- **Subscriptions and billing** — no clean Amazon equivalent → **RevenueCat** in front of StoreKit and Play Billing. Apple and Google hold the money; RevenueCat normalises the two; Convex mirrors the result.
- **Mobile build and distribution** — no Amazon equivalent → **EAS Build, Submit, and Update**, plus App Store Connect and Play Console.
- **Secrets** — Amazon Secrets Manager → environment variables on Convex (LLM key, RevenueCat secret key, webhook secret), Vercel, and EAS. Never in Git, never in a chat message.

---

## 6. Core entities and contracts at product level

Full field lists, indexes, and function signatures are in [convex-design.md](./convex-design.md). This section is the product-level view: what the tables are for, who may touch them, and what the main verbs are.

### The tables, grouped by what they serve

**Accounts and roles.** `profiles`, `artists`, `artistRequests`, `artistStats`.
One person, one profile. An artist is a profile with an approved `artists` row attached. `artistStats` holds the counters we do not want to recount on every screen: follower count, supporter count, and the rising score.

**Catalog.** `tracks`, `updatePosts`, `files`.
A track carries its audio file, artwork, visibility (public or supporters-only), publish state, duration, the precomputed peaks array for the scrubber, its embedding for semantic search, tags, and an admin hidden flag. An update post carries text plus an optional photo or voice note and an audience of Everyone or Supporters only.

**Connection.** `follows`, `reactions`, `presenceHeartbeats`, `listenEvents`.
Follow is the prerequisite for routing, the input to the feed, and the targeting list for push. Listen events feed rising-artist ranking, impact stats, and fans-to-thank scoring.

**Money.** `entitlements`, `supportRoutes`, `demoEarnings`.
Entitlement says "this person is paying". Support routes say "to these one to five artists". Demo earnings is a written-forward monthly record of how that subscription *would* have split, clearly labelled as not a payout. Nothing here is ever written by a client mutation except the route change, and that one checks entitlement and follow first.

**Personal collections.** `libraryItems`, `playlists`, `playlistEntries`, `mixes`.
All private to the owning profile. No sharing in V1, except that a mix has a public URL for the share-link journey.

**Messaging and delivery.** `thankYous`, `pushTokens`, `notificationSettings`, `artistMutes`, `pendingPushes`.
`pendingPushes` exists so a notification that lands inside someone's quiet hours is held and delivered afterwards rather than silently dropped.

**Admin.** `featuredSlots`, plus the `hidden` flags on tracks, posts, and artists, plus the `artistRequests` queue.

**Not tables — they live on the phone.** The outbox, the local download metadata, and the playback queue. See section 11 of the Convex companion.

### Authorization rules, by role

Every public Convex function starts by asking who is calling. Then:

- **Signed out.** Public tracks, Everyone posts, artist pages, mix pages. No writes at all.
- **Fan (free).** Everything above, plus follow and unfollow, reactions, listen events, library, private playlists, search, mix generation over public tracks, presence heartbeats, avatar upload, and submitting one artist request at a time. Cannot read a supporters-only track's audio URL or a supporters-only post's body.
- **Supporter.** Everything a fan can do. Plus: supporters-only tracks and post bodies **from artists in their active route set only**, download URLs for audio they can play, impact stats, and founding badges. Their route set is capped at five, every routed artist must already be followed, and it cannot be empty while the entitlement is active.
- **Artist.** Everything a fan or supporter can do for their own listening. Plus, scoped to their own artist row only: create and edit their profile, upload tracks, schedule and publish, write update posts, read their own supporter list, read their own demo earnings, and send thank-yous. An artist reading another artist's supporter list is the privacy bug to write a test for.
- **Admin.** The pending artist request queue (approve or decline), verify or unverify an artist directly, set hidden flags on catalog items, and place featured discovery slots. Nothing else. There is no admin read of a private playlist, an email, or a listening history in V1.

Two rules that are easy to get wrong and should be tested early:

1. A supporter routed to Artist A must be refused Artist B's exclusive, even though they are paying.
2. A supporter may not unfollow an artist who is currently in their route set. The unfollow mutation refuses; the user interface must route them to "remove from support first."

### The major verbs

Grouped the way the function map in the companion is grouped: auth and profile, catalog reads, feed, follow, entitlement and routing, playback helpers, offline replay, presence, reactions, mix and search, studio upload and publish, thank-you, admin, push. Named signatures are in section 5 of [convex-design.md](./convex-design.md).

---

## 7. High-level components

**`apps/mobile-app` (Expo).** The primary surface. Feed, discovery, search, artist pages, now-playing with the four craft techniques, library and playlists, downloads manager, paywall, routing, impact, notification settings, account settings including the artist request. Talks only to Convex, plus the RevenueCat SDK for purchase and restore.

**`apps/web-app` (Next.js on Vercel).** Three jobs in one app, separated by route group:

- Artist Studio — sign in, studio home, profile editor, upload with peak generation, releases list, update composer, supporters, fans-to-thank, demo earnings.
- Public pages — artist, track, post, and mix URLs that render for a signed-out visitor, with an install prompt and a deep link into the app when it is installed.
- Light fan player — browse, play, follow, sign in, and stream exclusives for a signed-in entitled supporter. No purchase, no offline, no craft techniques.

Also hosts the two link-verification files that make universal links and App Links work.

**Admin (thin, inside the web app).** An `/admin` route group behind the profile admin flag: pending artist requests, artists list with verify and unverify, catalog list with hide and remove, featured slots. Not a CMS.

**`packages/shared`.** Types generated from the Convex schema, design tokens used by both web and mobile from the first screen, the genre list, the reaction emoji set, the demo-earnings split constants, and pure helpers with no platform imports. Design-token drift is a named risk in the lock, so tokens ship before the first styled screen, not after.

**Convex.** The whole backend, as in section 4.

**Vercel.** Web host and the link-verification files.

**EAS.** Dev clients (background audio does not work in Expo Go), preview builds for real-device spikes, and store submissions. Every spike marked "real device" needs an EAS build first.

**RevenueCat.** Store subscription layer, with the Convex profile id used as the RevenueCat `appUserId` so a webhook can find the right row without guessing.

**Expo Push.** Delivery for release, update, thank-you, milestone, and recap notifications.

**Data flow, in one paragraph.** A screen calls a Convex query or mutation over a persistent connection. The function checks identity, then role, then the specific resource. Reads come back and stay subscribed, so the screen updates when the underlying data changes — no client cache layer to invalidate. Writes are transactions: everything in that mutation lands or none of it does. Slow or external work (calling the LLM, calling RevenueCat's API, sending a push) goes in an action, usually kicked off from a mutation or the scheduler. Server data lives in subscribed Convex queries; Zustand holds only client-side extras like the playback queue and the visualizer toggle. There is no TanStack Query layer on top of Convex for the same data.

---

## 8. Numbers this document closes

The lock deliberately left these to system design. Here are the defaults. They are concrete on purpose so no ticket has to guess.

### Presence heartbeat and staleness

- **Heartbeat every 20 seconds** while audio is actually playing, including background playback. Paused means no heartbeat.
- **A listener counts as present for 60 seconds** after their last heartbeat. So the count goes stale within about a minute, exactly as the lock says.
- **One row per profile**, patched in place rather than inserted. A person listens to one track at a time, so presence never grows unbounded.
- **A cleanup cron every 10 minutes** deletes rows whose last heartbeat is older than 10 minutes, so the table stays small even if a client dies mid-session.
- Write volume, the named risk: 3 writes per minute per active listener. Fifty concurrent listeners is 150 writes per minute. That is comfortable. If the spike shows otherwise, the first lever is moving the heartbeat to 30 seconds and the freshness window to 90 seconds, not removing presence.

### Rising-artist ranking

Deterministic, computed by a nightly cron into `artistStats`, and fully explainable in the case study. Window is the **trailing 7 days**:

- 4 points per new follower in the window
- 1 point per distinct listener in the window
- 0.5 points per play that passed 30 seconds in the window
- plus a flat 10-point newcomer bonus if the artist's first published track is less than 30 days old
- ties broken by most recent publish, then by artist creation time

Artists with zero signals in the window are excluded from the organic list rather than shown with a score of zero. Admin featured slots render above the organic list and are not scored. Seed writes synthetic follows and listen events inside the window so day-one discovery is not empty.

### Onboarding genre list

Twelve fixed genres, stored as a constant in `packages/shared` and as string keys on the profile. Not a table — a table would invite a genre editor nobody asked for.

Afrobeats, Amapiano, Highlife, Alté, Afro-soul and R&B, Afro-house, Hip-hop and Drill, Gospel, Bongo Flava, Francophone Afropop, Reggae and Dancehall, Jazz and Instrumental.

Onboarding requires **at least two**, with no maximum. Genres bias the discovery list and the first feed; they are not an access rule.

### Offline local metadata store

**Pick `expo-sqlite`.** One reason: the outbox is an ordered queue where individual rows change state independently (queued, sending, failed, done), and AsyncStorage is a single key-value blob — every outbox change would rewrite the whole list, and two concurrent writes can silently lose an entry. SQLite gives per-row updates and a real transaction, which is what an idempotent replay needs. Downloads metadata lives in the same database so "what is on disk" and "what is queued" are one store, not two.

### Waveform peak generation

**Default: decode in the browser during Artist Studio upload.** The file is already in the browser's memory at upload time, so the Web Audio API can decode it and downsample without the server ever fetching the bytes back. A Convex Node action would have to re-download the full audio file and decode it under a function time limit, which is the slower and more fragile path.

The spike is still required before the upload ticket. It must measure a 6-minute mp3 end to end, confirm Safari as well as Chrome, and confirm the scrubber position matches the audio position. If browser decode fails on Safari or is too slow, the fallback is the Convex Node action and the lock gets a line added.

**Peak array shape, fixed now:** 1000 buckets regardless of track length, each a number from 0 to 1 rounded to three decimals. That is about 8 KB on the document, comfortably inside a Convex document, and more resolution than any phone screen can draw. Seed tracks get the same 1000-bucket format from the local Node script so the scrubber code has exactly one shape to handle.

### Entitlement caching for offline playback

- The entitlement row stores `currentPeriodEnd` (when the paid period runs out) and `lastVerifiedAt` (when the server last confirmed it).
- Offline playback of an exclusive is allowed while **both** are true: the current time is before `currentPeriodEnd`, and less than **7 days** have passed since `lastVerifiedAt`.
- Outside that, exclusive playback is refused with an honest "reconnect to keep playing supporter tracks" message. Public downloads keep playing.
- This is a membership check, not **DRM** (copy-protection that encrypts a file so only a special player can open it). The file stays readable on disk; Kindred simply will not play it. That is the accepted V1 position.

### Push thresholds and quiet hours

- Artist milestone pushes fire at the 1st, 10th, 25th, 50th, 100th, 250th, and 500th supporter. No others.
- Quiet hours default to 22:00–07:00 in the profile's own timezone, stored as an IANA timezone string on notification settings.
- A push generated inside quiet hours is **held, not dropped**, and delivered at the end of the window — except the optional monthly recap, which is dropped because a day-late recap is noise.
- Per-artist mute is checked before the quiet-hours check. A muted artist's push is never created.

### Demo earnings split

Written by a monthly cron, forward only, never recalculated. The formula is a labelled demonstration of how a real store-billed app would feel, not accounting and not a payout:

- Start from the supporter’s monthly price ($4.99 or $9.99).
- Keep **70%** as the artist pool (stand-in for the store’s usual ~30% cut).
- Split that 70% **equally** across the active routed artists on the day the cron runs.
- Show the other 30% on the earnings screen as “store fees (demo)” so the math is honest about store billing.
- The 70/30 constants and tier prices live in `packages/shared` so web and mobile cannot drift.
- Every screen showing these numbers carries the words "demo earnings — not a real payout."

### Seed size and egress estimate

Do this arithmetic before seeding, per section F of the lock.

- 12 artists, 3 with deep catalogs. About **500 track rows** total, most of them lightweight filler rows that exist to prove long-list performance.
- **40 unique audio files**, averaging roughly 3.5 MB for a three-to-four minute track at a modest bitrate. That is about **140 MB** of audio. Filler rows reuse those 40 files rather than each having their own.
- **60 unique images** (covers, avatars, banners) at roughly 200 KB each, about **12 MB**.
- Total seed storage budget: **under 200 MB**. Check the current Convex plan's storage and bandwidth allowances against that number before running the seed, not after.
- Egress per 90-second demo run: roughly **20 MB**, because the demo plays parts of a handful of tracks.
- The number that would force the R2 move: about 50 regular testers each playing 30 tracks a month is roughly **5 GB a month** of audio leaving Convex. If real usage heads there, open the object-storage ticket. The product rules do not change; only the URL does.
- Vector storage for 500 tracks at 1536 numbers each is single-digit megabytes. Not a concern.

---

## 9. External dependencies, decided

Anything that comes from outside the code needs five answers: what it is, where it comes from, what rights we have, how it gets into the product, and what we are not doing. Here they are.

### Seed cover art, artist photos, and banners

- **What.** About 60 images: 12 artist avatars, 12 cover banners, and roughly 36 release artworks reused across the filler catalog.
- **Where from.** Unsplash or Pexels as the default, or simple originals we make (a texture plus a type treatment). No scraped photos of real artists, ever.
- **Rights.** Unsplash and Pexels licences allow commercial and portfolio use without a fee. Where the licence asks for credit, the photographer's name is stored on the file row and rendered on the artist page credits line. All artist and release names are fictional.
- **How it ships.** A local seed script keeps chosen files in a `seed/assets/images` folder in the repo, uploads them to Convex file storage at seed time, and writes the returned storage ids plus the credit string onto the `files` rows.
- **Out.** AI-generated cover art, real artist likenesses, and any image whose licence we cannot name in one line.

### Seed audio

- **What.** 40 unique tracks, three to four minutes each.
- **Where from.** CC0 or CC-BY sources only — Free Music Archive's CC-BY sets, ccMixter, and similar. Each file's source page URL is recorded in the seed manifest.
- **Rights.** CC0 needs no credit; CC-BY needs the artist name and licence. Both are recorded on the file row and shown on the track credits line in the app. A one-page rights note listing every track, source, and licence is prepared for store review before the first submission.
- **How it ships.** Files sit in `seed/assets/audio` in the repo. The seed script computes the 1000-bucket peaks array locally with a Node script, uploads the audio to Convex storage, and writes the track row with peaks, duration, and credit in one go.
- **Out.** Anything NC (non-commercial), anything ND (no derivatives), anything where the licence is unclear, and any real commercial recording.

### LLM and embedding provider

- **What.** Two things: a text-embedding model for semantic search and mix retrieval, and a chat model for the mix's one-line why, the upload copilot's draft tags and description, and the fans-to-thank one-liner.
- **Default recommendation for V1: OpenAI.** Use `text-embedding-3-small` for embeddings and a small current chat model for the three text features. One reason: it is a single account and a single key covering both jobs, with structured output support so the copilot returns a typed object instead of prose we have to parse.
- **Rights and cost.** Pay-as-you-go on my own account. The volume is trivial: 500 seed embeddings once, one embedding per upload, and a few hundred short completions across the whole demo.
- **How it ships.** Key lives in a Convex environment variable. Every call happens inside a Convex action. No key ever reaches the phone or the browser.
- **Swappable.** Nothing in the design depends on OpenAI specifically. The embedding dimension is written once in the schema and the chat calls go through one wrapper. If the vector spike or the AI fixture spike shows a better fit (cost, latency, or output quality), swap the provider at spike time and update this line. Changing the embedding model after seeding means re-embedding all tracks, so decide it at the spike, not in November.
- **Out.** A chatbot, AI-written feed posts, AI cover art, AI lyrics, and any path where the model publishes something without the artist confirming it.

### RevenueCat and the stores

- **What.** Two auto-renewing monthly subscription products at $4.99 and $9.99 with identical entitlements, on both App Store Connect and Play Console, grouped under one RevenueCat entitlement.
- **Where from.** My own Apple Developer, Google Play, and RevenueCat accounts.
- **Rights and prerequisites.** Apple's Paid Apps Agreement must be signed and Play merchant setup completed before a sandbox purchase will work. Sandbox testers must be created on both stores. This is paperwork that takes days, so it starts before the paywall ticket, not during it.
- **How it ships.** The RevenueCat Expo SDK on the phone, configured with the Convex profile id as `appUserId`. A Convex HTTP action receives the webhook. A Convex action calls RevenueCat's REST API for the restore and sync path.
- **Out.** Web checkout, annual plans, family plans, per-artist prices, one-off purchases, gifting, tips, and any real payout to an artist. Paystack payouts belong to an Africa-based Kindred that does not exist yet.

### Transactional email (Resend or equivalent)

- **What.** One email type only: the password-reset one-time code.
- **Where from.** Resend as the default, on my own account.
- **Rights and prerequisites.** Needs a verified sending domain before it works outside a test inbox. That verification is part of the reset spike, not an afterthought.
- **How it ships.** Wired into the Convex Auth Password provider's reset flow. Key in a Convex environment variable.
- **Out.** Marketing email, digests, receipts, and email as a notification channel. If the reset spike fails, this integration drops out of V1 entirely: the product ships signed-in change-password plus an admin reset path, and email reset moves to Later in the lock.

---

## 10. Phased build order and spike gates

Surface order is locked: mobile core first, then Artist Studio web, then public pages and the light web player. Within that, the order below puts the risky, gated work early enough that a failed spike still leaves time to change plan.

**Phase 0 — Foundations.**
Scaffold from the studio template. Convex project, Convex Auth Password sign up and sign in on mobile and web, profiles, design tokens in `packages/shared`, and an EAS dev client that actually installs on a real iPhone and a real Android. Write the minimum OS versions into the PRD now that the SDK is pinned.

**Phase 1 — Catalog and the seeded world.**
Schema for artists, tracks, files, and follows. The seed pipeline, including the local peaks script and the image and audio manifests. Artist page, track list, library, and private playlists. This has to come first because every later phase needs something to look at.
*Gate: none. This is the safe part.*

**Phase 2 — The player, including the queue.**
Audio playback with `expo-audio`, mini-player, now-playing, background audio and lock-screen controls, and the full queue behaviour from the lock: replace-on-play-from-context, play next, add to queue, reorder, remove, shuffle, repeat off/one/all, auto-skip locked tracks, stop at the end.
*Gate: the background audio and lock-screen spike must pass on a real device before this phase's tickets start.*

**Phase 3 — Craft technique one and two.**
The interruptible mini-player to now-playing shared-element transition, and the Skia waveform scrubber reading the seeded peaks array. Both on the real screens from Phase 2.
*Gate: none technically, but do not start until Phase 2 playback is stable, or you will debug two things at once.*

**Phase 4 — Connection.**
Follow, feed of update posts with locked shells, reactions, presence heartbeats, and listen events.
*Gate: the presence spike (two devices, count moves, backgrounding decays it) confirms the 20-second / 60-second numbers in section 8 before the presence ticket.*

**Phase 5 — Push and deep links.**
Expo push tokens in Convex, notification settings with quiet hours and per-artist mute, one release notification end to end, and deep links that open the right screen from a cold start.
*Gate: two spikes, both on physical devices — push cold start, and one universal link opened from Notes or Safari. Associated Domains and Digital Asset Links files must be live on Vercel first.*

**Phase 6 — Money.**
RevenueCat paywall, the Convex webhook, the restore and sync path, routing one to five followed artists, exclusive gating everywhere, impact stats, and founding badges.
*Gate: the RevenueCat spike must pass first — test webhook received, sandbox purchase, Convex row correct, app killed, restore works. Store paperwork must already be done.*

**Phase 7 — Offline.**
Downloads, the downloads manager, the SQLite local store, airplane-mode playback, the degraded banner, and the outbox with idempotent replay.
*Gate: the offline spike. If it shows the outbox is too large for the calendar, the lock's escape hatch is read-only offline downloads with the outbox moved to Later — and that requires editing the lock, not a quiet decision here.*

**Phase 8 — Search, mix, and craft technique three and four.**
Exact search first, then embeddings and semantic search, then the natural-language mix. In parallel, the shader visualizer with its low-power default and the iOS-quality sheet stack.
*Gate: the vector spike (embed 20 seed tracks, confirm sensible neighbours) before semantic search and mix.*

**Phase 9 — Artist Studio on web.**
Studio home, profile editor, upload with browser peak generation, the copilot, releases list, scheduled publish, update composer with photo and voice note, supporters list, fans-to-thank, and demo earnings.
*Gates: the peak-generation spike before the upload ticket, the AI fixture spike before the copilot and fans-to-thank tickets, the scheduled-publish spike before scheduling, and the Safari voice-note spike before the voice-note ticket.*

**Phase 10 — Artist request, admin, and the honest path.**
The request-to-become-an-artist form on mobile and web, the pending queue in admin, approve and decline, verify and unverify, hide and remove, and featured slots. This phase is what makes the demo-but-usable rule true: a stranger can become an artist without a seeded account.
*Gate: none. Do not let this slip to the end and then get cut — it is a required path, not polish.*

**Phase 11 — Public web and the light fan player.**
Artist, track, post, and mix pages, the install prompt, the deep-link handoff, and the signed-in light player including exclusive streaming for entitled supporters.

**Phase 12 — Proof.**
Store builds, TestFlight, Play closed testing, the 90-second demo script, the ACCESS-LIST file with demo logins, and the case study.

**The cut rule still runs on top of this.** On the first of each month after Phase 1 starts, compare what shipped to the V1 list. If less than half of what remains looks reachable by year-end, cut to the minimum-done tier that month.

---

## 11. Risks and what is deferred

### Risks, with the mitigation named

**A non-supporter gets a playable URL.** The worst bug in the product, because it is invisible until someone notices. Mitigation: one shared access helper used by playback, post bodies, downloads, mix building, search, and the public web pages; a test that signs in as a supporter routed to Artist A and fails to fetch Artist B's exclusive; and that test written the same week the entitlement table exists, not in launch week.

**The webhook arrives late and the purchase looks like it failed.** Mitigation: after a successful purchase the client calls the server sync path immediately rather than waiting, and the paywall shows a short "confirming your support" state rather than a false failure. The webhook then arrives and writes the same row idempotently.

**Outbox replay duplicates a follow or a listen event.** Mitigation: a client-generated id on every queued write, a receipts table keyed by profile and that id, and a first-line check in every replay target. Route changes carry the full intended set with a client timestamp so last-write-wins produces one coherent set rather than a merge.

**Audio egress cost grows quietly.** Mitigation: the estimate in section 8 before seeding, a monthly look at the Convex usage page, and a pre-written object-storage ticket that is ready to pull if the number moves.

**Presence write volume.** Mitigation: the conservative heartbeat, one patched row per profile, no heartbeat while paused, and the cleanup cron. The spike confirms the numbers before the ticket.

**The four craft techniques eat the calendar.** This is the real schedule risk, and the lock says they are never cut. Mitigation: they are spread across Phase 3 and Phase 8 rather than stacked, each is built into a real screen, and each gets its own ticket stream rather than being folded into a feature ticket.

**Safari refuses to record a voice note.** Mitigation: the spike runs before the ticket, and the documented fallback is photo and text updates only, with the lock updated to say so.

**Store paperwork blocks the paywall.** Apple's Paid Apps Agreement and Play merchant setup can take days and cannot be rushed. Mitigation: start both in Phase 0, long before Phase 6 needs them.

**Design tokens drift between web and mobile.** Named in the lock. Mitigation: tokens ship in `packages/shared` in Phase 0, before the first styled screen exists.

**Scope creep into building Spotify.** Mitigation: the lock's Later list, and the rule that nothing moves out of it without editing and re-approving the lock.

### Options considered and rejected

- **Supabase instead of Convex.** Would mean giving up built-in vector search, built-in file storage, the scheduler, and the reactive query model, and would add a second permission system next to the one Ridgeway already proved. Rejected.
- **R2 or a CDN for audio on day one.** Real long-term answer, unnecessary complexity for a seeded demo, and explicitly Later in the lock unless egress forces it. Rejected for V1, ticket pre-written.
- **A separate realtime service for presence.** Convex subscribed queries already do this. Rejected.
- **An ML ranking service for discovery.** The lock requires a deterministic, explainable score. A black box would be worse for the case study, not better. Rejected.
- **Convex Node action for peak generation as the default.** Kept as the fallback, not the default, for the reason in section 8.

### Deferred, and staying deferred

Everything on the lock's Later list: Sign in with Apple, Google sign-in, comments, direct messages, synced listening, lyrics, video, endless radio, real payouts, tipping, merch, gifting, annual and family plans, web checkout, fan uploads, public playlists, label organizations, the AI chatbot, AI cover art, CarPlay, Android Auto, widgets, watch, TV, and R2 unless egress forces it.

Also deferred, and worth naming because they are architecture-shaped rather than feature-shaped: cross-device playback sync, a real content-moderation pipeline beyond admin hide, analytics beyond what the product screens need, and any second Convex deployment or region.

---

## 12. Spike list, with the pass or fail we expect

Each spike is timeboxed, runs before the ticket it gates, and ends in a written line in the lock or the ticket: works, blocked, or cut to Later. Source is section 20 of the studio practice pack lock (`00-locked-decisions.md`).

**RevenueCat webhook to Convex entitlement.** Gates Phase 6.
Pass: a test webhook from the RevenueCat dashboard reaches the Convex HTTP action, a sandbox purchase on a real device writes an active entitlement row with the right profile, killing and reinstalling the app then hitting restore brings Supporter back, and a sandbox expiry flips the row to expired.
Fail: exclusives run on seed demo data, the paywall moves behind the monthly cut rule, and the case study says payments are next.

**Push on a physical device.** Gates Phase 5.
Pass: one notification type arrives on a real iPhone and a real Android, and tapping it from a fully closed app opens the app.
Fail: reduce to in-app notification cards for V1 and re-plan, because the lock requires push plus deep link for at least one event.

**Deep links and universal links.** Gates Phase 5.
Pass: a Kindred URL tapped in Notes or Safari opens the installed app on the right screen from cold, on both platforms, with the verification files served correctly from Vercel.
Fail: ship custom-scheme links inside the app and web fallback pages outside it, and write the gap into the lock.

**Background audio and lock-screen controls.** Gates Phase 2.
Pass: audio keeps playing with the phone locked, play and pause work from the lock screen, seek works if the installed SDK supports it, an incoming call pauses and resuming works.
Fail: no fallback — this is load-bearing for a music app. If it fails, the SDK version or the config plugin is wrong, and fixing it is the ticket.
Known acceptable limit: lock-screen next and previous may be missing depending on the Expo SDK version. In-app next and previous are enough.

**Waveform peak generation.** Gates the Phase 9 upload ticket.
Pass: browser decode of a 6-minute mp3 produces the 1000-bucket array in a time a person will wait through, on Safari as well as Chrome, and the scrubber position matches the audio position within a frame or two.
Fail: switch the default to a Convex Node action and record that in section 8 and in the lock.

**Offline downloads and outbox.** Gates Phase 7.
Pass: one track downloads, plays in airplane mode, a follow queued offline reaches the server on reconnect exactly once, and a duplicated replay changes nothing.
Fail: keep downloads read-only, move the outbox to Later, and edit the lock to say so. This is the only spike whose failure is allowed to shrink V1 scope.

**Presence heartbeat and TTL.** Gates Phase 4.
Pass: two devices playing the same artist show a count of two, backgrounding one and stopping playback drops the count within about a minute, and the write rate matches section 8.
Fail: raise the heartbeat to 30 seconds and the window to 90, or drop presence and keep reactions as the single realtime proof, per the minimum-done tier.

**Vector embeddings.** Gates semantic search and the mix in Phase 8.
Pass: 20 seed tracks embedded, and a plain-language query returns neighbours a human would call reasonable.
Fail: semantic search is first on the drop order. Exact search stays, and the mix falls back to rule-based retrieval over genres and tags with a templated one-line why.

**AI fixtures.** Gates the copilot and fans-to-thank in Phase 9.
Pass: one golden prompt fixture returns a structured object that validates, nothing auto-publishes, and a provider error leaves the artist with an empty editable form rather than a broken screen.
Fail: the copilot drops to manual entry and fans-to-thank keeps the deterministic ranking with a templated one-liner. The ranking itself is not AI and does not depend on this spike.

**Scheduled publish.** Gates scheduling in Phase 9.
Pass: a track scheduled one minute ahead flips to published on time and the follower push goes out at that moment, not before.
Fail: publish-now only for V1, scheduling to Later, lock updated.

**Web voice notes on Safari.** Gates the voice-note update ticket in Phase 9.
Pass: record in both Safari and Chrome, upload to Convex storage, play back in the mobile app.
Fail: updates ship as photo and text only, and the lock is updated.

**Password reset email.** Gates the reset ticket, any time after Phase 0.
Pass: the Convex Auth Password reset flow sends a one-time code through Resend from a verified domain, and the code completes a reset on both web and mobile.
Fail: V1 ships signed-in change password plus an admin or demo reset path, and email reset moves to Later in the lock.

---

## Next

1. This file and the Convex companion are **confirmed** against the live `kindred` Convex project (20 Sep 2026).
2. Linear **epics** exist (`KIND-1`–`KIND-13`). Full tickets wait until after screen design.
3. Workshop tools are up (GitHub, Linear, Vercel, Expo, Slack, Convex).
4. Grow product schema on this same Convex deployment in build order (companion section 12) — not before screen design locks the UX.
5. Next phase: screen design, then Linear build tickets, then build when you say so.

Nothing gets implemented as a feature until screens are locked and a ticket with a design link is In Progress.
