# Talking about Kindred in an interview

Read this before an interview where Kindred comes up. The first section is the 60-to-90-second version you lead with. The rest is a bank of real questions interviewers ask about a project, each paired with an answer grounded in how Kindred is actually built. The last section is the honest-limits list, so you raise the gaps yourself instead of getting caught by them.

What interviewers are really testing with "tell me about a project" is not the feature list. It is whether you understand the problem, can defend your decisions, know what they cost, and can say what you would change. Depth beats polish. A music app is easy to demo and easy to wave away as "a Spotify clone." Your job is to move the conversation to the part that is not a player. Who the money goes to, and what that payment unlocks.

One framing note. This is your own product, built as a portfolio flagship, to a real product spec. It is not a live App Store business with paying fans. Purchases in the build you can show run on RevenueCat's test store. Say that plainly when money comes up. It reads as honest, not weak.

---

## The opener (60 to 90 seconds)

Kindred is a mobile app for backing rising African artists. A fan pays one monthly subscription and routes it to one to five artists they choose. It is one subscription, split equally, and that routing is what unlocks those artists' supporters-only music. Artists don't upload from the phone. They use a web studio to release music and see who their real supporters are.

The interesting engineering is not playback. It's that paying does not unlock the catalog. It unlocks exactly the artists you route to right now. And the phone is never trusted to decide any of that. Apple or Google takes the money. RevenueCat tells our backend. The backend writes the "this person is a supporter" record. Every exclusive read then re-checks that record plus the route. A tampered client can't hand itself access.

I designed and built the whole thing solo. Expo on mobile, Next.js on web, and Convex as the entire backend. Convex is the database, auth, file storage, scheduled jobs, search, and the webhook endpoint, all in one place. That was on purpose, because every paid access decision has to live somewhere single and auditable.

---

## Questions they actually ask

### "So walk me through the project. What is it and what problem does it solve?"

Streaming already exists. What doesn't exist, for a lot of rising African artists, is a clean way for a fan to put a few dollars a month behind specific people and get something back for it.

Kindred is that. You sign up on the phone, follow artists, and stream what's public for free. If you subscribe, you pick one to five artists you already follow, and your money is split equally across them. That subscription unlocks their supporters-only tracks and posts. Adding another artist later doesn't start a second charge. It just changes who your existing subscription is routed to.

Artists are verified uploaders. They work from a web studio, not the phone. They publish or schedule a release, post an update to everyone or supporters only, and see their supporter list and a demo of how the month's money would split. There's a thin admin that approves people requesting to become artists and can hide or feature catalog items.

It's my own product, built to a locked spec. The catalog is seeded with openly-licensed audio, credited in-app. The earnings screen is clearly labelled as not a real payout.

### "Who are the users, and what can each of them do?"

Four roles.

A free fan streams public tracks, follows artists, searches by name, reacts, and sees an approximate live listener count. No exclusives.

A supporter is a paying fan. Everything a fan does, plus the supporters-only tracks and posts from the artists in their route, plus their own impact stats. There's a founding badge if they were one of the first ten people ever to route to an artist. It sticks even if the artist blows up or other supporters leave.

An artist is a fan account with an artist record attached. That's granted after they request it from the phone and an admin approves, or after an admin verifies them directly. Upload and scheduling are web-only.

An admin approves or declines artist requests, verifies artists, hides or removes catalog items, and places featured discovery slots. They can't read anyone's private playlists or listening history.

### "Draw me the architecture. What are the main pieces and how do they talk?"

Three surfaces, one backend.

Mobile is Expo. Feed, discovery, search, artist pages, the player, library, paywall, routing. Playback uses Expo's audio library. The queue, shuffle, and repeat state live on the device, because that's per-session state, not something to round-trip to a database. Everything else is Convex queries that stay subscribed, so a reaction or a listener count updates live for anyone looking at the same screen. Zustand holds only client extras like the visualizer toggle. There's deliberately no second cache in front of Convex for the same data.

Web is one Next.js app on Vercel, split by route group into the artist studio, public share pages, and admin. Public pages play public audio and show a locked shell with "get the app" for exclusives. That app also serves the association files Apple and Google use to verify deep links.

Convex is the entire backend. Database, email-and-password auth, file storage for audio and images, scheduled functions, full-text search, and the HTTP endpoint RevenueCat posts to. One backend was a choice, not laziness. I'll defend it if you want.

### "Why one backend? Most people would reach for a separate auth provider, a queue, maybe a search service."

Because every decision that matters in Kindred is an access decision, and access decisions are safest when there's exactly one place to get them right. The moment I have two systems that both know something about whether a person is a paying supporter, I have two permission models, and one of them will drift. That drift is how a non-supporter ends up with a playable URL.

Convex already covers what I'd otherwise bolt on. Scheduled functions instead of a queue for scheduled releases and quiet-hours push. Full-text search instead of a search service. An HTTP action instead of a separate webhook handler. File storage instead of a bucket. So the cost of one backend here is mostly vendor lock-in, which I accept for a solo product. I keep the design describable in plain cloud terms so it travels. Managed login, document database with indexes, object storage, scheduled jobs, a webhook endpoint, search. The one genuinely unusual thing is that the database doesn't filter rows for me. My functions are the only line of defence. That's why the access checks are centralized.

### "Why Convex specifically? Why not Firebase, or Supabase, or a plain Node API on Postgres?"

I weighed exactly those. The deciding factor was that Kindred's core is live, authorized reads, and Convex gives me real-time subscriptions and server-side authorization in the same function, in TypeScript, with transactions.

Take Firebase. Firestore gives real-time too, but its security lives in rules files, a separate little language, and my access check isn't a row predicate. It's "are you entitled and routed to this artist," which is two lookups. Expressing that in Firestore rules is painful, so in practice people push it into Cloud Functions and lose the real-time path. I'd rather have one place that's already both.

Take Supabase. I like Postgres, and Supabase's row-level security is genuinely good for per-row rules. But my realtime needs and my access logic are both more custom than row-level security wants to be, and I'd still be writing a lot of Edge Functions. I'd be buying a relational database I'd then mostly talk to through functions anyway.

Take plain Node plus Postgres. That's the most portable, and the one I'd reach for on a team that already runs it. The cost is that I'd hand-build the realtime layer, the file storage integration, the scheduler, and the webhook plumbing that Convex ships. For a solo portfolio product, that's weeks of undifferentiated work to rebuild what I get for free, and every one of those seams is a new place to get the entitlement check wrong.

The honest downside of Convex is lock-in. It's a smaller ecosystem, and it's not SQL, so a migration means rewriting functions, not swapping a driver. I keep the data model and access rules plain enough that porting is "reimplement these functions against a new store," not "untangle a mystery."

### "If Convex disappeared tomorrow, how would you rebuild this?"

Postgres for the data, with the artist-route and entitlement tables mostly unchanged, since they're already relational in spirit. The access helpers port almost directly, because they're plain TypeScript, not Convex-specific. I'd replace subscriptions with Postgres logical replication or a lightweight pub/sub for the two things that need live updates, which are reactions and presence, and leave everything else on normal fetches. File storage moves to S3 or R2 with signed URLs, which is actually the direction I'd want for audio anyway. The scheduler becomes a cron plus a job table. The RevenueCat webhook becomes an ordinary HTTP route. The thing I'd protect through the migration is that entitlement stays server-written and every exclusive read re-checks it. That rule is independent of the database.

### "Why React Native and Expo instead of native iOS and Android, or Flutter?"

One codebase, one language, shared types with the web app and the backend, and I'm one person. That's most of it. Expo specifically for the managed native modules and EAS build and update, so I can ship over-the-air JavaScript updates without a store round-trip and only pay for a cloud build when native code changes.

Native Swift and Kotlin would give the best possible craft, and for a company with separate iOS and Android teams that's often right. But it's two codebases and two skill sets for a solo product, and I'd lose the shared types that keep the client and server honest. Flutter is a strong single-codebase alternative. I didn't pick it because Dart wouldn't share types or validation with my TypeScript backend and web app, and that shared `packages/shared` is a real correctness win here. The place React Native bites is deep audio and animation craft, which is exactly where I spent extra effort. The Skia waveform, the shader visualizer, background audio. So I went in knowing that was the trade.

### "Why RevenueCat instead of talking to StoreKit and Play Billing directly?"

Because subscriptions are a surprising amount of edge-case handling. Renewals, grace periods, billing retries, refunds, restores. I'd have to implement all of it twice, once per store, and keep a webhook pipeline correct. RevenueCat normalizes both stores behind one SDK and one webhook, and gives me restore-purchases and a server API to reconcile when a webhook lags. For a solo build, reimplementing that is weeks of work on the one surface where a bug means someone pays and doesn't get access, or gets access without paying. The trade is a third-party dependency in the money path. I mitigate it by treating my own Convex entitlement record as the source of truth, not RevenueCat's cache.

### "What was the hardest part technically?"

Getting access right, because it's two questions that people instinctively collapse into one. Not "did they pay," but "did they pay, and is this specific artist in their current route."

`loadSupporterAccess` reads the entitlement record and the active routes for a person. `decideTrackAccess` then allows a supporters-only track only if they're entitled and routed to that artist, or if they're the artist who owns it. The same helper backs posts, downloads, mixes, search results, and the public web pages. So a supporter routed to artist A is correctly refused artist B's exclusive, even though their card is being charged. That exact case has a test, because it's the most plausible bug I could ship.

A lot of product rules fall straight out of that two-part check. Opening a locked track remembers which artist you came from and forces them into your first saved route. The route is capped at one to five and can't be empty while you're subscribed. You can't unfollow someone who's still in your route. And one subscription always covers the whole set, so adding an artist never starts a second charge.

### "Walk me through a purchase end to end. Where could it go wrong?"

Both price tiers, $4.99 and $9.99, grant the same access. The difference only shows up in how the demo earnings split looks. Apple or Google takes the payment. RevenueCat sits in front of both stores so I'm not writing StoreKit and Play Billing twice, and I set the RevenueCat user id to the Convex profile id so a webhook can find the right person without guessing.

RevenueCat posts to `/revenuecat/webhook`. The handler checks a shared secret, then a mutation writes the entitlement. The thing that makes it safe is idempotency. I store the event id, and if RevenueCat retries the same event, the second write is a no-op. Without that, a retried "subscription started" could create a duplicate record or a double month of demo earnings.

There are three failure modes I actually handle. The webhook lags, so there's a server-side sync that calls RevenueCat's API directly when the record looks stale. A reinstall loses local state, so restore purchases re-reads from the store and the backend rewrites the record. The saved route comes back with it, because cancelling pauses the route rows rather than deleting them. And when the paid period ends, exclusives re-lock, because every exclusive query re-reads the record rather than trusting a cached flag.

The one thing the phone never does is write "I'm a supporter." If it could, a modified build would unlock everything.

### "You mentioned demo earnings. How does that work in the data?"

Each month I write a record of how that subscription would split. Seventy percent is the artist pool, standing in for what's left after a store cut. That pool divides equally across the routed artists. The other thirty is labelled store fees. The screen says, in words, that it isn't a payout.

The important property is that it's written forward-only. Change your route in March and February is never recomputed. It's the same instinct as the founding badge. The first ten routes ever started for an artist are founding. I count both active and inactive route rows, so someone leaving doesn't reopen a slot, and once earned it's never recalculated. These are money-adjacent facts, and money-adjacent facts shouldn't silently rewrite themselves.

An artist only ever sees their own supporters and their own numbers. One artist reading another's supporter list is a privacy bug I wrote a test for. And the live listener count is deliberately a number, never a list of names, so "who's listening to me right now" can't leak. It's allowed to be about a minute stale, which is a product decision that keeps presence write-volume low.

### "How do you keep playback and the waveform scrubbing smooth?"

The waveform you drag has to move the audio in lockstep. Decoding the audio file on the phone to draw that shape would be slow and drain battery. So at upload time I slice the samples into a fixed number of peaks, normalize them, and store that array on the track. The phone just draws the array. Seeking is handled by the audio player. And the playable URL is fetched once per track, not re-resolved on every drag frame.

The visualizer, which is the animated waves, defaults off, and the fan opts in. I didn't want a shader running on every listen. And a locked track sitting in the queue is skipped on playback and never pops the paywall. Support only ever starts from a deliberate tap.

### "Audio is expensive to serve. What happened with storage and cost?"

That's the bill that actually bit me. Audio bytes live in Convex file storage. Egress, which is the bytes leaving the server when someone plays, is the meter that moves fastest for a music app, and on the free plan that cap is shared across the whole team, not per app. I crossed it during demo listening. The right fix was shorter seed clips and not prefetching the catalog, not blindly upgrading the plan.

There's also a security property here. A Convex storage URL is long and unguessable, but it isn't tied to a logged-in user, so anyone holding it can fetch the bytes. So audio URLs never appear in list responses or crawlable HTML. One function mints a URL, after the access check, for the single track about to play. If cost ever forced a move to object storage with signed links, the product rule wouldn't change. Only the URL would.

### "How does search work?"

Exact name match on artists and tracks, and I'll be honest about where I drew the line. I designed meaning-based search too, using a vector index, which turns text into numbers that capture its meaning and finds tracks whose numbers sit close to your query. I cut it from this version. Exact names are what a fan types when they already know who they want, and real semantic search needs an embedding API, a cost per query, and a quality bar I didn't want to fake with a canned list.

The natural-language mix feature is in the same bucket. Designed, not built. I'd rather tell you it's not in this version than demo a hardcoded playlist and call it a model.

### "Why can't a fan sign in on the website?"

Because the product decision was that the phone is the fan account, full stop. The web does exactly three jobs. The artist studio, public share pages, and admin. A second fan surface on web would be a second place to get follow, exclusive playback, and purchases wrong, and purchases have to be mobile anyway because that's where the stores are. Public pages still have to look real, so public audio plays in a simple player, exclusives stay locked, and an installed app can intercept the link.

### "How does someone become an artist?"

From the phone, in account settings, a fan submits a display name, bio, and a short why. The public handle is derived from the display name. Status moves through none, pending, approved, or declined, one pending request at a time, and you can re-request after a decline but not after an approval. An admin approves or declines. Approval creates the artist record and links it to that profile, and from then on they sign into the web studio and can upload. Seeded artists exist so the demo has a catalog on day one, but they don't bypass this path. On upload, the audio, artwork, and peaks are stored, an AI copilot suggests tags and a note, the artist edits and confirms, and nothing ever publishes itself.

### "Walk me through your data model."

It's grouped by what the tables serve. Accounts and roles are `profiles` (one per person), `artists` (a profile with an approved artist record), `artistRequests`, and `artistStats` for counters I don't want to recompute per screen. Catalog is `tracks` (audio file, artwork, visibility, publish state, the precomputed peaks array, tags, an optional embedding), `updatePosts`, and `files`. Connection is `follows`, `reactions`, `presenceHeartbeats`, and `listenEvents`. Money is the sharp part. That's `entitlements` (are you paying, written only by the server), `supportRoutes` (the one-to-five artists, with a founding flag), and `demoEarnings` (written forward-only). Personal collections are `libraryItems`, `playlists`, `playlistEntries`, and `mixes`. Delivery is `thankYous`, `pushTokens`, and `notificationSettings`.

Two modelling calls I'd highlight. A follow is a prerequisite row, not just a UI state, because routing requires it and the feed and push targeting read it. And routing is its own table rather than an array on the profile, because each route carries its own founding flag and active state, and I need to query "who routes this artist" for the founding count, which is awkward against an embedded array.

### "How does this actually get tested and shipped?"

CI is GitHub Actions. On every pull request it runs ESLint, Prettier, TypeScript type-check, and the test suites, on Node 22 with a frozen lockfile, and merge protection blocks the merge if any fail. Backend tests run in Vitest with Convex's test harness. The apps run in Jest. The tests I care most about are the access ones. A supporter routed to A is refused B's exclusive, the webhook is idempotent, an artist can't read another artist's supporters.

Shipping is two paths. Web is Vercel, which deploys previews per branch and production on merge. Mobile is EAS, with a preview workflow that cooks a build for real-device testing. I install native libraries before the first build on purpose, because a native package added later can't run until another cloud build, and the free plan's monthly build quota is small. JavaScript-only changes go out as over-the-air updates instead of a new build.

There's no formal migration tool. Convex applies the schema on push, so a shape change is a schema edit plus a one-off backfill function when needed. On a team with a live database I'd want a more disciplined migration story, and I'd say so.

### "What was the hardest bug you had to track down?"

The one that shaped the whole money path. Right after a test purchase, the app sometimes still showed the user as locked. The symptom was "I paid and I'm still a free fan."

I traced it to timing. I'd assumed RevenueCat's webhook would land before the user got back to the app, and sometimes it didn't, so my entitlement record didn't exist yet when the exclusive query ran. The tempting fix was to let the client write "I'm a supporter" after a successful purchase. That would have been a security hole, because then a tampered client could grant itself access.

The fix was two parts. I kept the webhook as the normal path, but added a server-side sync that calls RevenueCat's API directly when the record looks stale or missing, so the server reconciles from the real source instead of trusting the phone. And I made the webhook idempotent with a stored event id, because once I was reconciling from two paths, the same event could arrive twice and I couldn't allow a double write. Prevention is that the entitlement is still only ever server-written. The race got slower and safer, not papered over.

### "Beyond login, how did you think about security?"

A few layers. Authorization is the big one, and it's all server-side. The client never decides entitlement or routing, and every exclusive read re-checks. Input validation is at the boundary, because every Convex function declares validators for its arguments, so a malformed or unexpected payload is rejected before my code runs. The RevenueCat webhook checks a shared secret before it does anything. Secrets like the LLM key, the RevenueCat key, and the webhook secret live in Convex, Vercel, and EAS environment variables, never in Git or the client bundle. And the audio-URL rule from earlier is a security decision. A storage URL isn't a credential, so I only mint it after the access check and never put it anywhere crawlable.

Here's where I'm honest about gaps. There's no rate limiting on public mutations yet. At a seeded demo's scale it hasn't mattered, but if this had real traffic, reactions, follows, and the artist-request form are the endpoints I'd put a limiter in front of first. Convex has a rate-limiter component I'd reach for.

### "How would you know if something broke in production?"

Today I'd lean on the Convex dashboard, which shows function logs, errors, and per-function performance, plus Vercel's logs for the web app and EAS and store crash reporting for mobile. Convex's usage view is how I caught the file-egress problem. For a real product that's not enough, and I'd say so. I'd want structured alerting on the money paths specifically. A failed webhook, an entitlement write that errors, a spike in access-denied on exclusives. Those are the failures that cost trust rather than just annoy. The honest version is that I have the logs and the dashboards, not a paged on-call setup, because this isn't carrying real users.

### "You built this solo. How did you handle code review, and how would you work on a team?"

I kept the discipline even without a second reviewer. Every change went through a branch per ticket, a pull request, CI gates, and the same PR description format every time, with sections for Why, What, How, and Testing, so there's a written rationale on each change rather than a pile of commits to main. The architecture decisions live in the system-design docs, which is my stand-in for the design review a team would do before building.

For an automated reviewer I leaned on what I had at no cost, mainly AI assistance inside my editor to sanity-check diffs before opening a PR. The tool I'd actually want is a dedicated PR reviewer like CodeRabbit, which reads the whole diff in context and flags issues on the pull request. I've held off paying for it deliberately. It's a per-seat cost I'd put on a funded project, not on a solo portfolio build. That's the same prioritization I apply everywhere here. I don't take on a recurring bill until a paying project justifies it, and I'd add CodeRabbit on day one of a client job precisely because catching a bug in review is cheaper than catching it in production.

What I'd genuinely gain from a team, or from that reviewer, is the adversarial read on the access logic. The bug I'm most afraid of is a quiet permission mistake, and a second pair of eyes on those functions is worth more than on anything else. So on a team I'd ask for review specifically on the authorization helpers and the webhook, and I'd be the reviewer who pushes on "what happens if this runs twice" and "what does a non-supporter see here."

### "How did you decide what to cut under the deadline?"

By protecting the thing that makes Kindred Kindred and cutting around it. The non-negotiables were the money path and access. Purchase, entitlement, routing, exclusives. Everything else was negotiable against the date. So meaning-based search got cut to exact-name search, the natural-language mix got deferred, and push and offline were pushed later. None of them change what the product fundamentally is, and each has a real external dependency, like an embedding API, a mail provider, or device testing, that I didn't want to half-build. The rule I used was to cut features whole, with a written note, rather than shipping five things at eighty percent.

### "What would you do differently?"

Two things. I'd move audio off database file storage sooner, or keep the seed clips short from day one, because I learned the egress cost by hitting the wall rather than predicting it. The access rule was already right. The bytes were just in the wrong cheap place for a media app.

And I'd sequence the device-only features, push and offline downloads, so I finish them only when I can test on a real phone, since a simulator can't prove background audio or notifications. One thing I'd keep. I installed the native libraries before the first phone builds, so I didn't later burn a limited cloud build just to add a package.

The one thing I would not change is splitting entitlement from routing. That split is the product.

### "What's still unfinished?"

The natural-language mix isn't built. Meaning-based search isn't in this version. Push notifications are designed, including server-side quiet hours, but delivery isn't finished. Offline downloads are designed, with files on the device plus an outbox of writes to replay, but not shipped. Password-reset email is waiting on a mail provider. And the low-power switch that forces the visualizer off needs a newer phone build, because the battery module isn't in my current binary. The toggle itself works. Real payouts, tipping, and web checkout are deliberately out of scope.

---

## If they push harder

- **"Define entitlement."** The backend's record that a person is a paying supporter right now. Written only from RevenueCat. The phone reads it, never writes it.
- **"Define a route."** The one-to-five artists the subscription is currently split across. Exclusive access checks the route, not just the fact of payment.
- **"What does idempotent mean in your webhook?"** Processing the same event twice yields one result. I store the event id, and the second delivery finds it and stops.
- **"Why pause routes instead of deleting on cancel?"** So re-subscribing restores the exact set the person chose, and so the founding count, which includes inactive rows, doesn't reopen a slot.
- **"Why 'first ten ever' for founding, not 'current top ten'?"** Because a badge that someone else's churn can revoke isn't a badge. First-ever is a promise. Current-top flickers.
- **"Where does the access check live?"** `convex/lib/access.ts` for the decision, and `convex/lib/supporterAccess.ts` for loading the record and routes. Call sites pass the gate in. Copy-pasting the check into each query is how a variant becomes the bug.
- **"What breaks first under real load?"** File egress, not query volume. The database reads are small. The audio bytes aren't. The escape hatch is object storage with short-lived links behind the same check.
- **"Explain this stack to an AWS person."** Cognito-ish login, a document database with indexes instead of RDS, S3-like object storage, scheduled functions instead of SQS, an API-Gateway-style HTTP endpoint for the webhook, and built-in search instead of OpenSearch. No CDN in this version, which is the cost risk I already hit.

---

## Raise these yourself before they find them

- It's a portfolio build to a real spec, not a live store app with paying fans.
- Demo earnings are a labelled illustration. Artists aren't being paid.
- Purchases run on RevenueCat's test store on the dev build.
- Search is exact-name only. The sentence-to-mix feature isn't built.
- Push and offline downloads are designed, not finished.
- Audio URLs are minted only after the access check. The URL itself isn't a credential.
- I won't quote monthly listeners, revenue, or conversion, because I don't have production numbers. I designed for a small audience and a seeded catalog.
