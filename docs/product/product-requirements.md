# Kindred — product requirements (V1)

**Project:** Kindred, patronage app for rising African artists  
**Date:** 16 Sep 2026  
**Owner:** Delasi Mensah (solo product, portfolio flagship)  
**Horizon:** V1 through 31 Dec 2026

The product lock is the product lock (studio practice pack), approved 16 Sep 2026. This PRD is the build-facing version of that lock, filled from the filled questionnaire (studio practice pack) using the studio project-requirements template.

**Linear tickets come from this file.** If a feature is not here, it is not built. If this file and the lock disagree, the lock wins and this file gets corrected. Nothing moves from Later into V1 without revising and re-approving the lock.

---

## 1. Goal (one sentence)

Kindred is a native-feel mobile app where fans back rising African artists with one monthly subscription routed to the artists they choose, plus a web studio where those artists release music, see who their real fans are, and thank them.

---

## 2. Users and platforms

- **Users:**
  - **Fan (free).** Listens, follows, sees Everyone updates, uses discovery and search, sees presence, leaves light reactions. Cannot unlock exclusives.
  - **Supporter (paying fan).** Everything a fan can do, plus exclusives from routed artists, offline downloads of entitled audio, impact stats, and the founding badge where earned.
  - **Artist.** Verified uploader. Runs the Artist Studio on web for profile, releases, updates, supporters, thank-yous, and demo earnings. May use the mobile app as a fan or supporter; upload and scheduling are web-only in V1.
  - **Studio admin.** Thin web tools: pending artist requests (approve/decline), verify artists, hide or remove catalog items, place featured discovery slots.
- **V1 platforms:** Both. Mobile (Expo) is the primary fan and supporter surface. Web (Next.js) has exactly three jobs: Artist Studio, public pages, and a light fan web player.
- **Notes:**
  - One account per person. An artist account is a fan account with artist privileges after verification via **Request to become an artist** → admin approve, or admin verify directly. Seeded heroes do not replace that path. An artist can support other artists.
  - Studio admin is a Profile role flag set only by seed (admin demo login) or a one-off dashboard/internal mutation — no public become-admin flow.
  - iOS is the craft bar. Android ships functional parity for playback, follow, feed, paywall, notifications, and offline; V1 does not block on Android-perfect motion.
  - Purchases are mobile-only. No purchase path on web. Signed-in entitled supporters may stream exclusives on the light web player; offline and craft stay mobile.
  - No craft techniques and no offline on web.
  - Minimum OS versions (Expo SDK 57): iOS 15.1+, Android API 24 (Android 7.0)+.
  - Surface build order: mobile core, discovery, and connection first, then Artist Studio web, then public pages and the light fan web player.
  - Basic music listening (play, queue, next/previous, shuffle, repeat, library, playlists, search, background audio) is a V1 baseline. Kindred’s difference is patronage and money routing, not a thin player.

---

## 3. Core flows (V1)

Acceptance-ready, from the 20 locked journeys. Each one is done when the stated end state is true on a real device against real Convex.

1. **Sign up and onboard.** A fan signs up with email and password, picks genres, follows at least two artists, and lands on a feed that already has content.
2. **Play with the mini-player and now-playing.** A fan plays a track, the mini-player appears, expanding to now-playing is an interruptible shared-element transition, and audio continues in the background with lock-screen play and pause, plus seek where the installed SDK supports it. In-app next and previous always work from the queue. Lock-screen next and previous when the SDK supports them.
3. **Queue, shuffle, and repeat.** Playing from an artist list, playlist, library, mix, or search builds an up-next queue (or play next / add to queue when chosen). The fan can view, reorder, and remove upcoming tracks, and use shuffle and repeat (off / one / all). Locked tracks in the queue are skipped. When the queue ends and repeat is off, playback stops.
4. **Scrub the waveform.** A fan drags the Skia waveform, which draws from the stored peak array, and audio seeks in lockstep.
5. **Toggle the visualizer.** A fan turns the shader visualizer on or off on now-playing. It defaults off when the OS reports low-power mode (iOS Low Power Mode; Android equivalent chosen in system design if available).
6. **Follow, get pushed, land in the right place.** A fan follows an artist, receives a push when that artist releases or posts, and tapping it from a cold start opens that exact screen.
7. **Artist publishes from the studio.** A verified artist publishes a release immediately or schedules it, and posts an update marked Everyone or Supporters only, from the Artist Studio on web.
8. **Buy a subscription.** A fan buys $4.99 or $9.99 monthly through the RevenueCat paywall, Convex shows Supporter from the server-side source of truth, and reinstalling and restoring purchases brings Supporter status back.
9. **Route the subscription.** A supporter routes to one to five artists they already follow, equal split. If they follow fewer than five, all followed artists are pre-selected up to five. If they follow more than five, they must pick before exclusives unlock. They can change the set later; empty routing is not allowed while subscribed.
10. **Exclusives, routed only.** A supporters-only track or post opens for a supporter routed to that artist. For everyone else it shows a locked shell with a call to action, and the server refuses the body or media. Paying does not unlock exclusives from artists the supporter is not routed to.
11. **Download and go offline.** A supporter downloads entitled audio, manages downloads, plays local files in airplane mode with a degraded banner, and queued actions (follows, reactions, play history, route changes) replay to the server on reconnect without duplicating.
12. **Presence and reactions.** An artist's screen shows an approximate live count of current listeners that decays within about a minute of listeners stopping, and a fixed small emoji reaction on a track appears for other viewers live. No synced listening.
13. **Natural-language mix.** A fan describes what they want and gets a named, playable mix built only from tracks they can access, preferring routed, then followed, then general, with a one-line why. No chat UI. The mix is empty only if the user has zero playable tracks.
14. **Search.** A fan searches and sees exact artist and track matches first, then semantic results below.
15. **Artist upload end to end.** An artist uploads audio and artwork on web, a peak array is produced during upload, the copilot suggests tags, a description, and a short release note, the artist edits and confirms, then schedules or publishes, and followers get a push. AI never publishes on its own.
16. **Supporters, earnings, thank-you.** An artist sees their supporter list and demo earnings clearly labelled as not real payouts, opens fans-to-thank for a ranked shortlist with a drafted one-liner, edits it, sends it, and that fan receives a thank-you push and card.
17. **Impact and founding badge.** A supporter sees their impact stats, and a founding badge on an artist where their routing began while that artist had fewer than 100 supporters.
18. **Admin.** An admin reviews **pending artist requests**, approves (verify) or declines, can also verify an account directly, hides or removes a catalog item so it stops appearing, and places a featured discovery slot.
19. **Public web and install.** A public artist, track, post, or mix URL renders on the web with a light player and an install prompt, and deep links into the app when it is installed.
20. **Request to become an artist.** A signed-in fan submits a request (display name/handle + optional note) from account settings, sees pending status, and after admin approval can open Artist Studio and upload.

**Out of scope for V1**

Auth:

- Sign in with Apple
- Google sign-in
- Any social or SSO provider added mid-build

Social:

- Comments
- Direct messages
- A fan-to-fan social graph

Listening:

- Synced listening parties
- Marketed gapless or crossfade
- Lyrics
- Music video and podcasts
- Endless radio when the queue ends
- Lock-screen next and previous while the installed Expo SDK lacks them

Monetization:

- Real artist payouts, bank or Mobile Money (Paystack when an Africa-based Kindred goes live)
- Tip jar, donation button, or any send-money control
- Per-artist prices and one-off track purchases
- Merch and tickets
- Gifting a subscription
- Annual and family plans
- Web checkout for fans

Catalog:

- Fan-uploaded audio
- Public or collaborative playlists
- Label organizations
- A public artist marketplace

AI:

- Chatbot
- AI-written feed posts
- AI cover art and AI lyrics
- AI moderation beyond admin hide

Platforms:

- CarPlay and Android Auto
- Widgets
- Watch and TV
- Desktop-native

Infrastructure:

- R2 or a CDN for audio, unless Convex storage or egress forces the move. If it happens, product rules do not change: same entitlement check, different URL.

Portfolio lane:

- Meridian Stay, Anchor Dental, Harbor Chambers, unless a paying client appears

---

## 4. Core entities

Main nouns and how they relate. This drives the Convex schema and `packages/shared` types.

- **Profile.** One account per person, created by Convex Auth email and password. Holds display name, avatar file, genre preferences from onboarding, and role flags (including admin). Relations: may have one Artist; may have one Artist request; owns follows, playlists, library items, downloads, reactions, listen events, mixes, push tokens, notification settings, and at most one active entitlement.
- **Artist.** The public act, created when admin approves an Artist request or verifies a Profile directly. Holds name (from the request display name when created via request), bio, cover and avatar files, and verification state. Relations: belongs to one Profile; has many Tracks and Update posts; is the target of Follows, Support routes, Presence, and Thank-yous.
- **Track.** One playable audio item. Holds title, audio File, artwork File, visibility (public or supporters-only), optional `publishAt` for scheduled release, duration, a precomputed peaks array for the Skia scrubber, an embedding for vector search, tags and description, and an admin hidden flag. Relations: belongs to one Artist; referenced by library items, playlist entries, downloads, reactions, listen events, and mixes.
- **Update post.** A feed item from an artist. Holds body text, an optional photo File or voice-note File, and audience: Everyone or Supporters only. Relations: belongs to one Artist; read access decided by audience plus the reader's route to that Artist.
- **Follow.** A Profile follows an Artist. Relations: Profile to Artist. Required before that Artist can be routed. Drives feed and push targeting.
- **Entitlement.** Supporter status for one Profile, written only from the server-side RevenueCat source of truth (webhook plus a server sync path). Holds product or price tier, active state, current period end, and the cached expiry used for offline checks. Relations: belongs to one Profile. The client never writes this.
- **Support route.** One routed artist for one entitled Profile. At most five active per Profile, equal split, and the routed Artist must be followed. Holds started-at, active state, and a founding flag set when routing began while that Artist had fewer than 100 supporters. Relations: Profile to Artist. This is the single gate for exclusive access and for demo earnings.
- **Demo earnings.** A clearly labelled monthly record of how a supporter’s subscription would look after a store-style fee and then split across their routed artists. Formula: 70% of the monthly price is the artist pool (stand-in for Apple/Google’s usual ~30% cut); that pool is split equally across routed artists for the period; the other 30% is shown as “store fees (demo).” Relations: Profile to Artist, per period. Written forward only; changing routes never recalculates past months. Not real money and never shown as a payout.
- **Playlist** and **playlist entry.** A private, account-only ordered list of Tracks. Locked tracks can stay listed but will not play. Relations: Playlist belongs to a Profile; entries point at Tracks. No sharing in V1.
- **Library item.** A liked or saved Track for a Profile. Relations: Profile to Track.
- **Download.** A supporter's local copy of a Track: local file reference, size, state, and the entitlement check result at download time. Relations: Profile to Track. Playback of an exclusive download is denied once the cached entitlement expiry has passed without a successful sync.
- **Presence heartbeat.** A short-lived row written while a Profile is playing a Track, used to count approximate listeners per Artist. Holds timestamp for TTL expiry. Relations: Profile to Track, therefore to Artist. Heartbeat interval stays conservative because write volume is a known risk.
- **Reaction.** One emoji from a fixed small set, from a Profile on a Track. Relations: Profile to Track. No comments.
- **Listen event.** A play record used for rising-artist ranking, impact stats, and fans-to-thank scoring. Relations: Profile to Track. Queued through the outbox when offline, and written idempotently.
- **Mix.** A saved natural-language mix: the prompt, the resolved ordered Tracks, and the one-line why. Relations: belongs to a Profile; references Tracks; has a public web URL.
- **Thank-you.** A message from an Artist to a supporting Profile, drafted by AI and edited by the artist before sending. Holds body, sent-at, and read state. Relations: Artist to Profile; triggers a push and shows as a card in the app.
- **Push token.** An Expo push token for one device of one Profile. Relations: belongs to a Profile; many per Profile.
- **Notification settings.** Per-Profile delivery rules: per-artist mute and quiet hours, default 22:00 to 07:00 local, enforced server-side before sending. Relations: belongs to a Profile, with per-Artist mute rows.
- **File.** A stored blob in Convex file storage: track audio, artwork, avatars, cover images, update photos, voice notes. Relations: referenced by Tracks, Update posts, Artists, and Profiles. Moving audio bytes to object storage later changes the URL, not these relations.
- **Admin catalog control.** The thin admin surface's state: pending artist requests, artist verification, hidden flags on catalog items, and featured discovery slots with their position and target Artist or Track. Relations: set by an admin Profile; read by discovery queries.
- **Artist request.** A fan’s request to become an artist. Holds display name/handle, optional note, status (pending / approved / declined), timestamps. At most one pending per Profile; re-request allowed after decline; not after approve. Relations: belongs to one Profile; admin approve creates/links the Artist.

Client-side only, not server entities: the **outbox** queue of pending mutations and the local metadata store backing downloads. Both live on the device; the server sees only the idempotent mutations they replay.

---

## 5. Integrations and external systems

- **Convex** — Database, auth tables, file storage, actions, crons and scheduler, HTTP actions, and vector search. Single source of truth for entitlement and every access decision. Owner: my Convex project.
- **Convex Auth (Password provider)** — Email and password sign-in for all roles. Owner: my Convex project.
- **RevenueCat** — Store subscriptions at $4.99 and $9.99 monthly with identical entitlements. Expo SDK on the client with the Convex user id as `appUserId`; a Convex HTTP webhook writes entitlement rows, plus a server sync path for when webhooks lag; restore purchases supported. Owner: my RevenueCat account.
- **Apple App Store Connect and TestFlight** — Subscription products, sandbox testers, Paid Apps Agreement, and distribution. Also hosts Associated Domains for universal links. Owner: my Apple Developer account.
- **Google Play Console** — Subscription products, merchant setup, testing tracks, distribution, and App Links verification. Owner: my Play account.
- **Expo Notifications and the Expo Push API** — Device tokens stored in Convex; sends triggered from mutations, crons, and the scheduler; quiet hours and per-artist mute filtered server-side. Owner: my Expo account.
- **EAS Build, Submit, and Update** — Dev clients and store builds. Background audio requires a dev client or EAS build; Expo Go is not assumed. Owner: my Expo account.
- **Vercel** — Hosts the Next.js web app: Artist Studio, public pages, light fan player, and the `apple-app-site-association` and Digital Asset Links files. Owner: my Vercel account.
- **LLM and embedding API** — Natural-language mix, upload copilot, and fans-to-thank one-liners, plus track embeddings for semantic search. Called only from Convex actions with keys in Convex environment variables. Provider chosen at the vector and AI spikes. Owner: my account.
- **Transactional email (e.g. Resend)** — Password-reset OTP codes only, and only if the reset spike passes with a verified sendable from-address. If the spike fails, this integration drops out of V1. Owner: my account.
- **CC0 / CC-BY audio sources** — Seed catalog audio, with a credit to the audio source in the app and a rights note for store review. Not an API; a content dependency of the seed pipeline.

---

## 6. Rules and compliance

- **Permissions.**
  - Free fan: public tracks, Everyone posts, follow, discovery, search, presence, reactions.
  - Supporter: all of the above, plus supporters-only tracks and posts from routed artists only, downloads of entitled audio, impact stats, and founding badges.
  - Entitlement is written only from the server-side RevenueCat source of truth. The client never decides it. Every exclusive query re-checks Convex. A hidden button is not access control.
  - Routing requires an existing follow, is capped at five, is an equal split with no custom percentages, and cannot be empty while subscribed. Route changes apply immediately going forward and never rewrite past demo-earnings months. A supporter cannot unfollow an artist who is currently in their route set; they must unroute first. Cancellation and billing changes are managed in the App Store or Play; in-app shows status, restore, and store-manage instructions.
  - Locked content returns a shell and a call to action. The server refuses the body and media to unauthorized callers.
  - Only verified artists upload audio, and only from the web studio. Fans never upload audio. A fan becomes eligible by submitting an artist request from mobile or web account settings (one pending at a time; re-request allowed after decline; not after approve); admin must approve (or verify directly) before Studio upload works. On approve, an Artist is created/linked with the requested display name. An artist sees their own supporters and their own demo earnings, not another artist's.
  - Admin can review pending artist requests (approve/decline), verify artists, hide or remove catalog items, and place featured slots. Nothing else.
  - When entitlement ends, exclusives lock again. Downloaded exclusive files may remain on disk, but playback is denied after a cached entitlement expiry check when offline. This is a membership check before play, not DRM (encrypted copy-protection).
- **Compliance.**
  - Store framing: the subscription unlocks exclusive digital content inside the app. There is no tip jar, no donation button, and no send-money control. Artist earnings screens show **demo earnings** (70% of price as artist pool after a store-fee stand-in, equal split across routed artists; 30% shown as store fees demo) and are labelled as not real payouts. Purchases happen on mobile only.
  - Audio rights: seed catalog is CC0 or CC-BY only, with fictional branding, a credit to the audio source in the app, and a rights note prepared for review.
  - Personal data: emails, avatars, listening history, support routes, and supporter lists are private. Supporter lists are visible to the artist they support and to nobody else. Secrets stay in Convex environment variables, never in Git. Real legal wording is required before a public launch privacy page; none is invented here.
- **Special rules.**
  - Scheduled publish flips the track at `publishAt` through the Convex scheduler and enqueues pushes at that moment, not before.
  - AI never auto-publishes. The upload copilot writes drafts only; the artist confirms or edits. Fans-to-thank ranks deterministically from supporter and listen data, with the LLM writing only the one-liner, which the artist edits before sending.
  - Founding badge is earned when routing to that artist began while the artist had fewer than 100 supporters. It is not granted retroactively and not revoked when the artist grows.
  - Outbox replays must be idempotent. A follow, reaction, listen event, or route change that replays twice produces one result.
  - Quiet hours default to 22:00 to 07:00 local and are applied on the server before a push is sent, along with per-artist mute.
  - Presence is approximate and ambient by design. It is a count, not a list of names.
  - Rising-artist discovery ranking is deterministic from recent follows and listen events (weights and window in system design). Admin featured slots sit above the organic list. Seed may pre-warm signals so day-one discovery is not empty.

---

## 7. Non-functional requirements (summary)

- **Scale.** A public consumer app at portfolio scale: 12 seeded artists with 3 heroes, extra catalog rows for list performance, synthetic listening history, demo accounts, and a small real audience. The load that matters is presence heartbeat write volume, listen events, long-list rendering, and audio egress, not concurrent-user records.
- **Availability.** Best effort, one developer, one Convex deployment, one Vercel project. Store review timelines and real-device test windows drive the schedule more than uptime does.
- **Latency.** Playback start and scrub-to-seek must feel instant. Reactions appear live. Presence is approximate and goes stale within about a minute, with the exact TTL set in system design after the presence spike. Mixes and semantic search do server-side work and show honest loading states.
- **Offline and realtime.** Offline is supporters-only and is custom client work on top of Convex, which is online-first. Downloads plus an outbox for follows, reactions, play history, and route changes, replayed idempotently on reconnect, with a degraded banner while offline. Free fans stream online only. Realtime covers presence and reactions; there is no synced listening.
- **Performance and cost watch items.** Convex file storage and egress while audio streams from Convex storage, vector and search storage against plan limits, and seed size estimated before seeding a large audio catalog. If egress forces a move to object storage, that is a later ticket that changes the URL and not the product rules.
- **Reliability risks named up front.** Entitlement must never be decided client-side. A saved route must survive reinstall and restore. Outbox replay must not duplicate. A track that was published on schedule must not un-publish.
- **Craft and look.** Four mobile techniques are non-negotiable and are built into real screens, not sandboxes: the interruptible mini-player to now-playing shared-element transition, the Skia waveform scrubber drawing precomputed peaks, the shader visualizer with a user toggle defaulting off in low-power mode, and an iOS-quality sheet stack. Peaks are never decoded live on the phone. Design tokens are shared across web and mobile from the first screen.

### Spikes before build

Each spike produces a short written outcome — works, blocked, or cut to Later — before the ticket it gates starts. Source: section 20 of the product lock (studio practice pack).

- **RevenueCat webhook to Convex entitlement** — before the paywall ticket. Send a test webhook, purchase in sandbox, confirm the Convex row, kill the app, restore.
- **Push on a physical device** — before the push tickets. One notification type on a real iPhone and a real Android, including cold start.
- **Deep links and universal links** — before the deep-link and push-payload tickets. One link from Notes or Safari opens the right screen from cold.
- **Background audio and lock-screen controls** — before the playback tickets. Play, lock the phone, control from the lock screen, take a call, resume. Accept SDK limits on next and previous.
- **Waveform peak generation approach** — before the artist upload ticket. Pick browser decode or a Convex Node action, measure a 6-minute mp3, record array size, confirm the scrubber matches audio seek.
- **Offline downloads and outbox** — before the offline tickets. Download one track, play in airplane mode, queue a follow, come back online, confirm server state. If it is too large for the calendar, minimum-done may keep read-only offline downloads and move the outbox to Later, only by editing the lock.
- **Presence heartbeat and TTL** — before the presence ticket. Two devices, the count moves, backgrounding decays it. Sets the interval and TTL.
- **Vector embeddings** — before semantic search and mix tickets. Embed 20 seed tracks and confirm a query returns sensible neighbours.
- **AI fixtures** — before the copilot and fans-to-thank tickets. One golden prompt fixture test with structured output and no auto-publish.
- **Scheduled publish** — before the scheduling ticket. Schedule one minute ahead in dev; confirm publish and push.
- **Web voice notes on Safari** — before the voice-note update ticket. Record on Safari and Chrome, play back in the app. If Safari fails, updates fall back to photo and text and the lock gets updated.
- **Password reset email** — before the reset ticket. Convex Auth Password reset OTP flow with a transactional email provider, end to end on web and mobile. If it fails, V1 ships signed-in change password plus an admin or demo reset path and email reset moves to Later.

---

## 8. Success and priorities

- **Success for V1.**
  - A stranger installs, signs up, follows, plays, subscribes, routes artists, unlocks an exclusive, downloads, goes offline, and comes back, with nobody narrating it for them.
  - The 90-second demo runs on a real phone with no fake screens and no excuses.
  - A fan can request to become an artist, get admin approval, and reach Artist Studio without relying on seed. An artist goes from raw audio to a published or scheduled release with a push, then names and thanks a real supporter.
  - The case study can honestly claim consumer craft, push and deep links, background audio, IAP entitlements, offline with an outbox, shipped AI, large-list performance, and store distribution.
- **Minimum-done tier** (the floor if year-end is at risk):
  - Streaming playback, artist profile, library and playlists, exact search.
  - All four craft techniques. Never cut.
  - Artist Studio: upload and publish one release and one update. Seed-assisted is acceptable for the demo login; the request → admin approve path still exists.
  - One realtime proof: presence or reactions.
  - Push plus deep link for at least one event, proven on a real device.
  - One AI feature: mix or upload copilot, preferring mix.
  - RevenueCat may slip to Later only through the monthly cut rule. If it slips, exclusives run on seed demo data and the case study says payments are next.
- **Cut rule.** On the first of each month after Phase 1 build starts, compare shipped work to the V1 list in the lock. If less than half of what remains looks reachable by year-end at the current pace, cut to the minimum-done tier that month. Not in the final weeks.
- **Drop order, first to go:**
  1. Semantic search, keeping exact search.
  2. The second and third AI features, keeping the mix.
  3. The second realtime feature, keeping either presence or reactions.
  4. Voice notes in updates, falling back to photo and text, if the Safari spike fails.
  5. Email password reset, falling back to signed-in change password plus an admin or demo reset path, if that spike fails.
  6. The outbox, down to read-only offline downloads, and only by editing the lock.
  7. RevenueCat and live purchasing, last, and only through the monthly cut rule.
- **Never cut:** the four craft techniques, server-side entitlement truth in Convex, exclusives gated per routed artist, and the basic music player bar (queue, shuffle, repeat, next/previous).

---

## 9. Screens the product needs

So design and tickets have a list. Screen names are functional, not final copy.

**Mobile, fan and supporter (Expo, primary surface)**

- Sign up, sign in, and sign out. Forgot password only if that spike passes.
- Onboarding: pick genres, then follow artists with a minimum of two before continuing.
- Home feed: updates from followed artists, with locked shells and a call to action on supporters-only posts.
- Discovery: rising artists and featured slots, with follow as the primary action rather than play.
- Search: one input, exact artist and track matches first, semantic results below.
- Artist profile: tracks, updates, presence count, follow, support call to action, founding badge where earned.
- Track or post detail, including the locked state for content the viewer cannot open.
- Now-playing: artwork, Skia waveform scrubber, shader visualizer toggle, queue (view / reorder / remove), shuffle, repeat, play next / add-to-queue actions from track menus, reactions.
- Mini-player: persistent across the app shell, expanding into now-playing.
- Natural-language mix: prompt entry, generated mix with its one-line why, and playback.
- Library: liked and saved tracks, playlists.
- Playlist detail, private to the account, with unplayable locked entries shown honestly.
- Downloads manager: what is downloaded, size, and remove.
- Paywall: $4.99 and $9.99 with identical entitlements, and restore purchases.
- Route support: pick or change one to five followed artists, equal split, with the follow requirement and the five cap enforced in the UI and on the server. Unfollow of a routed artist is blocked until that artist is removed from the route set.
- Impact: what this supporter's subscription went to, per routed artist, demo numbers, labelled, plus founding badges.
- Thank-you card: the message from an artist, opened from a push.
- Notification settings: per-artist mute and quiet hours.
- Account settings: avatar, change password, subscription status, restore purchases, manage-subscription instructions (App Store / Play), **Request to become an artist** (and request status: none / pending / approved / declined), sign out.

**Artist Studio (web, upload and scheduling live here only)**

- Sign in.
- Studio home: recent releases, scheduled items, supporter count, recent thank-yous.
- Artist profile editor: name, bio, avatar, cover.
- Upload release: audio and artwork, peak generation during upload, copilot suggestions for tags, description, and release note, artist edit, visibility (public or supporters-only), publish now or schedule.
- Releases list with scheduled, published, and hidden states.
- Update composer: text, photo, or voice note, audience Everyone or Supporters only.
- Updates list.
- Supporters: who routes to this artist, since when, founding status.
- Fans to thank: ranked shortlist, drafted one-liner, edit and send.
- Earnings: demo earnings, clearly labelled as not real payouts.

**Public web**

- Artist page, track page, post page, and mix page, each with a share-friendly URL.
- Light fan player: browse, play public tracks, follow, sign in. Entitled supporters stream exclusives for routed artists; others see locked shells with a get-the-app call to action for purchase. No purchase, no offline, no craft techniques.
- Account settings on web player: change password, subscription status / restore instructions, **Request to become an artist** (and status), sign out.
- Install prompt and deep link handoff into the app when installed.
- Sign in and sign up for the web player.

**Admin (thin web)**

- Pending artist requests: approve or decline.
- Artists list with verify and unverify.
- Catalog list with hide and remove.
- Featured discovery slots: choose and order what appears.

**Shared states, on every surface**

- Loading: skeletons matching the real layout, not spinners over empty pages.
- Empty: a real next action, and never an empty feed for a seeded demo account.
- Error and retry.
- Locked or not allowed: the shell plus a call to action, distinct from an error.
- Offline degraded banner on mobile, with clear indication of what still works.

---

## Next steps

- After you approve this PRD: system design and Convex design, carrying the spike list into ticket ordering.
- Then Linear epics and tickets, written from this file.

This PRD is the source of truth for what gets built. the product lock (studio practice pack) is the source of truth for what was decided. Tickets cite this file; scope changes edit the lock first.
