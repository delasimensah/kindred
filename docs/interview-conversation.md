# Talking about Kindred in an interview

Read this when you need to explain Kindred to someone who was not in the room while it was built. The short answer is for the first two minutes. The conversation is what happens when they keep asking. The last section is what to say before they find a gap themselves.

Interviewers are not scoring a feature list. They are checking whether you understand the problem, the decisions you made, the cost of those decisions, and what you would change. A music player is easy to demo and easy to misunderstand. Kindred’s difference is who the money goes to, and what that unlocks.

This is your own product, built as a portfolio flagship: a fan app for backing rising African artists, plus a web studio where those artists release music. Purchases in the build you can demo are practice purchases, not a live App Store business. Say that early.

---

## The two-minute answer

I built Kindred. Fans back rising African artists with one monthly subscription, routed to the artists they choose. Artists release music from a web studio and see who their real supporters are.

The phone app is the fan product. The website has three jobs only: the artist studio, public share pages, and a thin admin. There is no fan account on the web.

The hard part is not playback. Paying does not unlock the whole catalog. It unlocks the one to five artists that person currently routes to, in an equal split. The phone never decides that someone is a supporter. Apple and Google hold the money. RevenueCat tells our server. The server writes the row. Every exclusive read checks that row again, and checks the route.

I designed it and built it: Expo on the phone, Next.js on the web, Convex as the whole backend.

---

## The conversation

### Tell me about something you built.

**Interviewer:** Pick a project. What problem was it actually solving?

**You:** Streaming already exists. What does not exist, for a lot of rising African artists, is a simple way for a fan to put a few dollars a month behind specific people and then hear the music those people keep for supporters.

Kindred is that. A fan signs up on the phone, follows artists, and can listen to what is public. If they subscribe, they pick one to five artists they already follow. One subscription covers that set. It splits equally. Adding another artist does not start a second purchase. It changes the route.

Artists do not upload from the phone. They sign into a web studio, publish a release or schedule it, post an update for everyone or for supporters only, and see a supporter list and a demo of how the month would have split. An admin approves people who ask to become artists, and can hide a track or feature one on discovery.

I built this myself, as my own product. The catalog you hear in a demo is seeded, with credit to the audio source. It is not a label’s catalog, and the earnings screen is labelled as not a real payout.

### Who is allowed to do what?

**Interviewer:** Four kinds of people, I assume. Keep it short.

**You:** A free fan can listen to public tracks, follow, search by name, react, and see an approximate listener count. They cannot open exclusives.

A supporter can do all of that, plus supporters-only tracks and posts from artists in their route, and a view of their own impact. A founding badge appears if they were one of the first ten people ever to route to that artist. The badge stays if the artist grows, and the slot does not reopen if someone leaves.

An artist is a fan account with an artist record attached, after they request it from the phone and an admin approves, or after an admin verifies them directly. Upload and scheduling are web only.

An admin can approve or decline those requests, hide catalog items, and place featured slots. They cannot read someone’s private playlist or listening history.

### How is it built?

**Interviewer:** Components. What talks to what?

**You:** The phone app is Expo. Feed, discovery, search, artist pages, the player, library, paywall, and routing. Playback uses the audio library that ships with Expo. The queue, shuffle, and repeat live on the device, because that is session state, not a database row. Server data comes from Convex queries and stays subscribed, so a reaction shows up for someone else who is looking at the same track. Zustand holds a few client extras, such as whether the visualizer is on. I did not put a second cache in front of Convex for the same records.

The website is one Next.js app on Vercel, split by route: studio, public pages, admin. Public pages play public audio. An exclusive shows a locked shell and tells the visitor to get the app. The web app also hosts the files Apple and Google use to verify links into the installed app.

Convex is the whole backend: database, email-and-password sign-in, file storage, scheduled work, search, and the HTTP endpoint RevenueCat calls. I did not add a second database, a second queue, or a second realtime service. Every paid decision has to be made in one place. Two permission models is how a non-supporter gets a playable URL.

### Why is “they paid” not enough?

**Interviewer:** This is the part I want slowly.

**You:** There are two questions, and they are never collapsed into one. Is this person a supporter right now? Is this artist in their active route?

`loadSupporterAccess` reads the entitlement row and the active routes. `decideTrackAccess` then allows a supporters-only track only when the person is entitled and routed to that artist, or when they are the artist who owns it. The same helper covers posts. A supporter routed to artist A is refused artist B’s exclusive even though they are paying. That case has a test, because it is the bug I am most likely to ship by accident.

A few product rules fall out of that split.

- Opening a locked track from one artist remembers that artist. The first time they save a route, that artist has to be included. They have to follow them first. They can change the set later from account settings, and that artist’s exclusives lock again if they remove them.
- The set is one to five. Empty is not allowed while they are subscribed. If adding this artist would make six, this artist stays and they remove someone else before saving.
- They cannot unfollow an artist who is still in the route. The unfollow mutation refuses. They remove them from support first.
- One subscription covers the whole set. A second artist never starts a second charge.
- If the subscription has ended, support opens the paywall again. If they cancelled but the paid time has not ended, they are still treated as paying.

The web page does not sell or route. It says get the app.

### How does the phone know someone paid?

**Interviewer:** Walk me through a purchase. Where can this go wrong?

**You:** The prices are $4.99 and $9.99 a month. Both grant the same access. The difference is how the demo split looks later, not what they can play. Apple and Google take the payment. RevenueCat sits in front of both stores so I am not writing two billing integrations. The Convex profile id is the RevenueCat user id, so a webhook can find the right person without guessing.

RevenueCat POSTs to `/revenuecat/webhook`. The handler checks a shared secret, then a mutation writes the entitlement. I store the event id first. If RevenueCat retries the same event, the second write is ignored. That matters because a retried “subscription started” must not create a second row or a second month of demo earnings.

Webhooks lag. There is a server sync that calls RevenueCat’s API when the webhook has not arrived yet. The phone does not write the entitlement. If I let the client say “I am a supporter now,” a modified app could unlock the catalog.

Restore purchases matters after a reinstall. The store still knows they paid. The server reads that and writes the row again. The saved route comes back with it, because cancelling pauses the route rows instead of deleting them.

When the paid period ends, exclusives lock again. Every exclusive query re-reads the row. A hidden button is not the lock.

In the build I demo day to day, those purchases are RevenueCat’s test store on the development app. A real phone preview can show the paywall screen. I have not shipped this as a store app, and I have not taken a real card payment. I say that before anyone asks whether artists are being paid.

### What do artists actually see about money?

**Interviewer:** You said demo earnings. What does that mean in the data?

**You:** Each month I write a record of how that subscription would have looked after a store-style fee, then split across the routed artists. Seventy percent of the monthly price is the artist pool. That stands in for the usual store cut. The pool splits equally. The other thirty percent is labelled store fees. It is not a payout, and the screen says so.

The record is written forward only. If someone changes their route in March, February does not get rewritten. That is the same instinct as the founding badge. The first ten routes ever started for an artist are founding. I count active and inactive rows, so someone leaving does not free a slot. Once earned, the badge is not recalculated.

An artist sees their own supporters and their own demo numbers. Reading another artist’s supporter list is the privacy bug I test for. The listener count on an artist page is a number, not a list of names, so “who is listening right now” cannot leak. The count can be about a minute behind. That is a product decision. Exact presence would mean a write from every listener on a short timer, and write volume was the risk I was avoiding.

### How does playback stay smooth?

**Interviewer:** You mentioned a waveform. What did you refuse to do on the phone?

**You:** Dragging a waveform has to move the audio with it. Decoding the file on the phone to draw that shape would be slow and would burn battery. When a track is uploaded, I slice the samples into a fixed number of peaks, scale them so the loudest slice is 1, and store that array on the track. The phone draws from the array. Seeking uses the audio player. The playable URL is fetched once for that track, not again on every drag frame.

The visualizer, the animated waves, defaults off. A fan can turn it on. I did not want a shader running on every listen.

The queue can contain a locked track. Playback skips it. A locked row does not open the paywall. Support starts from an explicit tap, not from “this song happened to be next.”

### Where does the audio live, and what did that cost you?

**Interviewer:** Media is where side projects get expensive. What happened?

**You:** Track bytes live in Convex file storage. Egress is the word for bytes leaving the server when someone plays a file. Upload is not egress. Audio is heavy, so this meter moves faster than database reads.

On the free plan that cap is shared by the team, not per app. This project crossed it during demo listens. I shortened the seed clips rather than treating a plan upgrade as the fix. I also do not prefetch a whole catalog.

There is a second limit. A storage URL is long and hard to guess, and it is not tied to the signed-in person. Anyone holding the URL can fetch the bytes. So list responses do not include audio URLs. A URL is handed out by one function, after the access check, for the track about to play. If cost forced a move to object storage and a CDN later, the product rule would stay the same. Only the URL would change.

### How do you search?

**Interviewer:** “Rainy evening highlife” — does that work?

**You:** Not in this version. Search matches artist and track names. A related list that finds tracks by meaning was designed, including a vector index, which is a list of numbers that captures what a piece of text means. I cut that from this version. Exact names are what a fan types when they already know who they want. Meaning search is a real feature, and it needs an embedding API, a key, and a quality bar I did not want to fake.

The natural-language mix is in the same place. A fan would describe a mood and get a named, playable mix with one line of why, built only from tracks they can access. That is designed and not built. I would rather say “not in this version” than demo a hardcoded playlist and call it a model.

### What is on the web, and what did you refuse to put there?

**Interviewer:** Why can’t a fan just sign in on the website?

**You:** Because the product decision was that the phone is the fan account. The website is the studio, the public page you can send someone, and a thin admin. A second fan account surface would mean a second place to get follow, exclusive playback, and purchases wrong. Purchases are mobile only, because that is where the stores are.

A public artist, track, or mix URL still has to look like a real page. Public audio plays in a simple player. Exclusives stay locked. If the app is installed, the link can open it.

### How does someone become an artist?

**Interviewer:** You said fans do not upload. How does a new artist get in?

**You:** From the phone, account settings, they submit a display name, a bio, and why. The public handle is derived from the display name. Status is none, pending, approved, or declined. One pending request at a time. They can ask again after a decline. They cannot ask again after an approval.

An admin approves or declines. Approval creates the artist record and links it to that profile. That person then signs into the studio on the web and can upload. Seeded artists exist so the demo has a catalog on day one. They do not replace this path.

The upload flow stores the audio, the artwork, and the peaks. A language-model copilot can suggest tags and a short note. The artist edits and confirms. Nothing publishes itself.

### What would you do differently?

**Interviewer:** What would you change, knowing what you know now?

**You:** I would move audio off the database vendor’s file storage earlier, or keep the clips short from the first seed. I learned the cost meter by hitting it. The access rule was already right. The bytes were in the wrong cheap place for a music app.

I would also finish push and offline only when I can test them on a real phone. Background audio, store purchases, and notifications do not prove themselves in a simulator. I installed the native libraries before the first phone builds so I would not spend a cloud build later just to add one package. That part I would repeat.

I would not collapse entitlement and routing into one flag. That split is the product.

### What is still open?

**Interviewer:** What would you be embarrassed to discover I clicked?

**You:** The natural-language mix is not built. Meaning search is not in this version. Push notifications are designed, including quiet hours on the server, and delivery is not finished. Offline downloads are the same: designed as files on the phone plus a queue of writes to replay later, not shipped. Password reset email is waiting on a mail provider. The low-power switch that forces the visualizer off needs a newer phone build, because that battery module is not in the binary I have now. The switch itself works. The waves can still be turned on by hand.

I would also not claim real artist payouts, a tip jar, or web checkout. Those are out on purpose.

---

## If they keep pushing

**What is an entitlement?** The server’s record that this person is a paying supporter right now. Written only from RevenueCat. The phone reads it. The phone does not author it.

**What is a route?** The one to five artists that subscription is currently split across. Exclusive access uses the route, not the fact of payment alone.

**What is idempotent, in this webhook?** Running the same event twice produces one result. The event id is stored. The second delivery finds it and stops.

**Why pause routes instead of deleting them?** A lapsed subscription should lock exclusives now and restore the same set when they pay again. Deleting the rows would throw away a decision the person already made. The founding count still includes inactive rows, so a pause does not reopen a founding slot.

**Why is the founding badge not “the ten people supporting them today”?** Because “first ten ever” is a promise. If it were “current top ten,” the badge would flicker every time someone cancelled. I do not want a badge that can be taken away by someone else’s churn.

**Where does the access check live?** `convex/lib/access.ts` for the decision, `convex/lib/supporterAccess.ts` for loading the row and the routes. Call sites pass the gate in. Copying the if-statement into each query is how a variation becomes the bug.

**What stays on the device?** The playback queue, shuffle, repeat, and the visualizer toggle. Follows, reactions, routes, and the entitlement row stay on the server.

**How would you explain Convex to someone who uses AWS?** Login directory, document tables with indexes, object storage, scheduled functions instead of a queue, an HTTP endpoint for the webhook, full-text search for names. No CDN in this version, which is the cost risk I already hit.

**What breaks first if a lot of people actually listened?** File egress. The database reads are small. The audio bytes are not. The escape hatch is object storage with short-lived links, after the same access check.

---

## Say this before they ask

- This is my own product, built to a real product lock. It is not a live store app with paying fans.
- Demo earnings are a labelled illustration. Artists are not being paid.
- Practice purchases run on the development app through RevenueCat’s test store.
- Search is exact name match. The mix-from-a-sentence feature is not built.
- Push notifications and offline downloads are designed and not finished.
- Audio URLs are minted only after the access check. The URL itself is not a login.
- I would not quote monthly listeners, revenue, or conversion. I do not have production numbers. The scale I designed for is a small audience and a seeded catalog.
