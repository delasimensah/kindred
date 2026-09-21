# UX Pilot flow prompts — Kindred

Locked design system: [design-system.md](./design-system.md). Screen list: [product-requirements.md](../product/product-requirements.md) §9. Layout language from [reference-map.md](./reference-map.md).

**Status:** prompts filled 20 Sep 2026; amended same day — **no fan account on web**; amended again — **no “demo” / “not a real payout” copy in any screen UI**. Before generating, set font (Satoshi + Clash Display if available) and colors (`#222831`, `#FFD369`, `#EEEEEE`) in UX Pilot.

**Cast (never “test user” or “Artist 1”):** Fan/supporter Efua Boateng (**mobile only**). Hero artists Amaara Mensah (Accra), Kweku Darko (Kumasi), Sela Okoro (Lagos). Also Téwá Nkrumah, Leye Ade. Studio signed in as Amaara Mensah. Admin Delasi Mensah. Money USD. Wordmark Kindred.

**UI copy rule:** Screens show a finished product. Never put “demo”, “Demo earnings”, “demo figures”, “not a real payout”, “illustrative only”, or portfolio/disclaimer banners in the design. Only features that exist in V1 appear.

**How to run:** Create flow “Kindred — Mobile” and “Kindred — Web”. Paste the matching Shared context once. Add screens in order below; paste each Screen prompt in full. Only **tab roots** say “Tab bar visible”. Stack, modal, sheet, auth = “No tab bar”. Web fan sign-in / sign-up / account screens are **out** — do not generate them.

---

## Design system (locked)

- **Palette source:** https://colorhunt.co/palette/222831393e46ffd369eeeeee
- **Primary:** `#FFD369` (button label `#222831`)
- **Neutrals:** page `#222831`, surface `#393E46`, text `#EEEEEE`, secondary `#EEEEEE` ~60% opacity
- **Accent chips:** `#FFD369` on `#393E46`
- **Type:** Clash Display 600/700 display; Satoshi 400/500/600/700 UI
- **Layout:** row padding 8–12px; sections 20–24px; radius 12px cards/buttons, 10px inputs, capsule pills; soft lift under glass only; 44px targets
- **Differentiator:** Dark mode
- **Anti-style:** No purple/lavender gradients; no cream+terracotta; no Apple red / Spotify green / SoundCloud orange / teal; no coffee-brown page; no fake solid glass; no lyrics, tip jars, social login, 3D mascots, “test user”, no “demo” / payout-disclaimer UI copy
- **Out of every screen:** lyrics, AutoMix, Family plan, music video, podcasts, tip jar, comments, DMs, social login, CarPlay, streaming payouts, tips as earnings lines, any “demo” or “not a real payout” labels

---

## Shared context (paste once per flow)

**For mobile flows, paste this:**

Kindred — fans back rising African artists with one monthly subscription routed to artists they choose. Brand: dark, soft gold on cool charcoal, belonging, modern music-app craft with liquid-glass chrome. Design system: Primary `#FFD369` (Follow, Support, Play, active controls; button label `#222831`). Page `#222831`, surface `#393E46`, text `#EEEEEE`, secondary text `#EEEEEE` at 60% opacity. Founding and impact chips: `#FFD369` on `#393E46`. Real frosted glass / liquid glass on floating pill tab bar and mini-player — never a solid fake glass box with a border. Typography: Clash Display SemiBold/Bold for now-playing titles, impact numbers, thank-you and paywall headlines (28–36px). Satoshi Regular/Medium/SemiBold/Bold for UI — body 16px, titles 20–24px, meta 13–14px. Layout: tight track rows 8–12px, sections 20–24px, artwork and cards 12px radius, capsule pills, soft lift only under mini-player and glass, 44px targets. Bottom native-style pill tab bar floating above home indicator: 4 tabs — Home (feed), Discover, Search, Library. Active tab tint `#FFD369`, inactive muted. Frosted mini-player sits in the accessory slot above the tab bar when audio is playing (thumbnail, title, artist, play/pause). No fifth Account tab — account from avatar. USD $4.99 and $9.99. Wordmark Kindred. People: Efua Boateng, Amaara Mensah, Kweku Darko, Sela Okoro. No social login, no lyrics, no tip jar, no purple gradients, no cream terracotta SaaS look, no Apple red, no Spotify green, no teal, no coffee-brown page, no “test user”, no comments, no “demo” or “not a real payout” copy on any screen.

**For web flows (Artist Studio, public pages, admin), paste this:**

Kindred — Artist Studio, public artist/track/post/mix pages, and thin admin on the web. Brand: same dark soft-gold music product as mobile. Design system: Primary `#FFD369` (CTAs; button label `#222831`). Page `#222831`, surface `#393E46`, text `#EEEEEE`, secondary `#EEEEEE` 60%. Typography: Satoshi for UI; Clash Display for large metrics (32–40px). Page titles 28–32px Bold, sections 18–20px SemiBold, body 15–16px, tables 13–14px. Layout: left sidebar + main for Studio and admin; public pages with top wordmark and fixed bottom simple player bar. Dense lists 12–16px, 24px between blocks, 12px cards, 10px inputs. Desktop 1280px+; usable at 1024px. No fan sign up, no fan sign in, no follow on web, no exclusive streaming on web, no purchase, no offline, no waveform scrubber, no shader visualizer, no liquid-glass craft. Public audio plays in a simple player; exclusives show a locked shell plus Get the app. Earnings UI is routed-subscription money only — never streaming payouts, tips, or “demo” / “not a real payout” labels. Wordmark Kindred. Signed-in studio: Amaara Mensah. Admin: Delasi Mensah. No purple SaaS, no light admin theme, no social login, no “test user”.

---

## Mobile flow — Auth and onboarding

### Screen: Sign in

Full-screen page `#222831`. Centered column max ~360px. Wordmark “Kindred” Clash Display Bold `#EEEEEE`. Title “Sign in” Satoshi SemiBold 24px. Stacked fields on surface `#393E46` 10px radius: Email (Efua Boateng’s email filled as efua@example.com placeholder style empty), Password with show/hide. Primary full-width capsule button `#FFD369` text `#222831` “Sign in”. Text link below “Create account” `#FFD369`. Helper “Email and password only.” Absolutely no Google, Apple, Facebook, or other social buttons. No Forgot password link. No tab bar.

### Screen: Sign up

Same chrome as Sign in. Title “Create account”. Fields: Full name, Email, Password, Confirm password. Primary `#FFD369` “Create account”. Link “Already have an account? Sign in”. No social buttons. No tab bar.

### Screen: Onboarding — genres

Full screen `#222831`. Title “What do you listen to?” Clash Display 28px. Subline “Pick a few genres to start.” Mosaic grid of large rounded tiles 12px radius (Highlife, Afrobeats, Amapiano, Afro-soul, Gospel, Hip-hop, Jazz, Traditional) — unselected `#393E46` with `#EEEEEE` label; selected tile outline or fill hint with `#FFD369`. Bottom sticky primary “Continue” `#FFD369` enabled when at least one selected. No tab bar.

### Screen: Onboarding — follow artists

Full screen `#222831`. Title “Follow artists”. Subline “Follow at least 2 to continue.” Counter pill top-right “2 of 2 minimum” turning gold when met. Vertical scrollable grid of artist cards: circular photo, name (Amaara Mensah, Kweku Darko, Sela Okoro, Téwá Nkrumah, Leye Ade), one-line genre · city. Each card has Follow capsule — unfollowed outline `#EEEEEE`, followed filled `#FFD369` text `#222831` “Following”. Sticky “Continue” `#FFD369` disabled greyed until ≥2 followed, then enabled. No tab bar.

---

## Mobile flow — Tabs and listening

### Screen: Home (tab)

Tab root. Page `#222831`. Top bar: wordmark “Kindred” left, circular avatar Efua Boateng right (opens account). Optional thin offline banner under top bar if offline: frosted strip “Offline — downloads and saved library still play” — only show as a variant note; default screen is online without banner.

Section “Updates” — vertical feed of artist posts (not TikTok vertical video). Each post card `#393E46` 12px radius: circular artist avatar, name SemiBold, time meta “2h ago”, body text 2–3 lines, optional photo. Public post from Amaara Mensah about a new single with playable track row (artwork 48px, title, play). Supporters-only post from Kweku Darko: lock icon + “Supporters only” chip, blurred/skeleton body, primary CTA “Support to unlock” `#FFD369`. No comment counts. No tip jar.

Frosted mini-player above tabs: 40px artwork, “Asase” · Amaara Mensah, play/pause. Below the feed or in a quiet header action: text button “Make a mix” that opens Mix prompt. Tab bar visible with Home selected.

**Also show one voice-note update card:** avatar, name, time, waveform-style voice note chip “0:42” with play — not a full track release.

### Screen: Discover (tab)

Tab root. Title “Discover” 24px SemiBold. Section “Featured” — one large hero card with cover, artist Sela Okoro, Follow `#FFD369` primary (not Play as primary). Section “Rising artists” — horizontal row of circular portraits with name and Follow pill under each (Amaara, Kweku, Téwá, Leye). Follow is the primary action on every artist card. Optional secondary play icon small, not competing. Mini-player present. Tab bar visible with Discover selected.

### Screen: Search (tab)

Tab root. Large glass-style search field at top (frosted, capsule) placeholder “Artists and tracks”. Results for query “amaara”: section “Top results” — artist row Amaara Mensah with Follow; track rows with artwork, title, artist, trailing ··· menu. Section below labelled “Related” (semantic) — 2–3 tracks with meta “Related to your search”. Exact matches always above Related. Mini-player present. Tab bar visible with Search selected.

### Screen: Library (tab)

Tab root. Large title “Library”. List of destinations as large rows with chevron: Playlists, Liked songs, Downloaded, Artists, Make a mix. Frosted mini-player. Tab bar visible with Library selected.

### Screen: Playlists list

Stack from Library. Title “Playlists”. Primary “Create playlist” `#FFD369`. List of playlist rows: cover, “Sunday reset”, track count. Empty state: “No playlists yet” + Create playlist. No tab bar.

### Screen: Create playlist

Stack/sheet. Title “New playlist”. Field Name. Primary “Create” `#FFD369`. Cancel. No tab bar.

### Screen: Library artists

Stack from Library. Title “Artists”. Alphabetical list of followed artists with avatar, name, chevron to artist profile. No tab bar.

### Screen: Artist profile

Stack from Discover/Search/Home. No tab bar (or tab bar hidden). Full-bleed cover photo of Amaara Mensah, gradient into `#222831`. Name Clash Display 28px. Presence line “128 listening now” meta. Founding badge chip `#FFD369` on `#393E46` “Founding” if viewer has it. Row of actions: primary Follow or Following `#FFD369`, secondary Support outline or filled “Support”, play circle for shuffle popular. Segments or sections: Popular tracks (numbered list with artwork, title, duration, ···), Updates (post cards), About (bio Accra · Highlife). Locked track in list shows lock icon and is not playable. Back chevron. Mini-player may peek. No Clips, Events, Merch, comments.

### Screen: Track detail (unlocked)

Stack. Large artwork. Title, artist link Amaara Mensah, visibility Public. Play `#FFD369`, buttons: Like, Add to playlist, Download (if supporter entitled), ···. Reaction emoji row same fixed set as now-playing. Description/release note short. No lyrics panel. No tab bar.

### Screen: Track or post detail (locked)

Stack. Same hero but content gated: lock badge “Supporters only”, body/artwork partially obscured, primary “Support Amaara Mensah” `#FFD369`, secondary “See plans”. Not an error state. No tab bar.

### Screen: Now-playing

Full-screen sheet over app (iOS-quality sheet; can stack above Home). Page dark from artwork wash into `#222831`. Large square artwork ~70% width, 12px radius. Song “Asase” Clash Display, artist Amaara Mensah. Skia-style waveform scrubber (precomputed peaks — vertical bars, scrub thumb) — not a thin system slider alone; label time 1:12 / 3:24. Transport: shuffle, previous, play/pause large, next, repeat with three visible states (off / one / all). Row of reaction emoji chips fixed set: 🔥 ❤️ 🙌 👏 ✨ (selected state gold ring). Toggle “Visualizer” switch — default Off; helper “Stays off in Low Power Mode”. Buttons: Queue, ···. No lyrics. No AutoMix. No endless radio. No tab bar.

### Screen: Queue

Sheet stacked on now-playing (sheet stack). Title “Queue”. Now playing row pinned. Section “Next Up” with drag handles on each row, trailing remove. Header icons: shuffle, repeat. Reorderable list. Locked upcoming tracks show lock and are auto-skipped in playback (still listed or omitted cleanly — show one locked row greyed with “Skipped if not unlocked”). No AutoMix toast. No tab bar.

### Screen: Track context menu (Play Next)

Overlay / context menu from ··· on a track row. Artwork + title header. Actions exactly: Play, Play Next, Add to Queue, Like, Add to Playlist, Download (if entitled), Share. Dimmed backdrop. No tab bar.

### Screen: Mini-player (chrome detail)

Not a separate destination — document as chrome: floating frosted bar above pill tabs, artwork, title one line, artist meta, play/pause; tap expands to now-playing. Show on Home with tabs for reference. Tab bar visible.

---

## Mobile flow — Mix, library detail, downloads

### Screen: Mix — prompt

Stack. Title “Make a mix”. One large multiline text field `#393E46` placeholder “Describe the mix — e.g. late-night highlife for studying”. Primary “Create mix” `#FFD369`. No chat bubbles, no message thread, no DJ persona. No tab bar.

### Screen: Mix — result

Stack. Playlist-style header artwork collage, title “Late-night Accra”, one-line why under title in meta: “Warm highlife and soft percussion from artists you follow.” Primary Play `#FFD369`. Track list 8–12 songs with artwork, title, artist; locked rows show lock and stay visible. No Familiar/Blend/Discover knobs. No tab bar.

### Screen: Playlist detail

Stack. Large playlist cover, title “Sunday reset”, private meta “Only you”. Play `#FFD369`. Track list; one locked supporters-only row shows lock + title greyed but visible (honest, not hidden). ··· per row. No tab bar.

### Screen: Liked songs

Stack. Title “Liked songs”. Play all. Long track list. No tab bar.

### Screen: Downloads manager

Stack. Title “Downloads”. Storage summary “124 MB on this phone”. List of downloaded tracks: artwork, title, artist, size, trailing Remove (destructive text). Empty state variant: “No downloads yet” + “Find music in Library”. No podcast rows. No tab bar.

---

## Mobile flow — Money, impact, settings

### Screen: Paywall

Modal sheet (sheet stack). Page `#222831`. Headline Clash Display “Back the artists you believe in.” Subline “One subscription. Route it to up to 5 artists. Same access at both prices.” Two stacked plan cards `#393E46` 12px: “$4.99 / month” and “$9.99 / month” — identical bullet list (exclusives from routed artists, offline for entitled tracks, impact). Selected card gold border `#FFD369`. Primary “Subscribe” `#FFD369`. Text button “Restore purchases” under cards. After success, next screen is Route support (not a tip jar). No Family plan, no lyrics feature list, no tip amounts. No tab bar.

### Screen: Route support

Stack/sheet after subscribe or from account. Title “Route your support”. Subline “Pick 1 to 5 artists you follow. Split is equal.” Counter “3 / 5”. Grid of followed artists with select; selected gold ring. Cannot select a 6th. Cannot Save with zero selected — primary disabled until 1–5. Equal split callout “Each gets 33%” updates with count. If first purchase and user follows ≤5, those artists appear pre-selected. Primary “Save routing” `#FFD369`. Note “Unfollow is blocked while an artist is routed — remove them here first.” No tab bar.

### Screen: Impact

Stack. Title “Your impact”. Big Clash Display number “$9.99” with label “This month”. Breakdown list per routed artist only (equal split of this month’s subscription): Amaara Mensah $3.33 + Founding chip, Kweku Darko $3.33, Sela Okoro $3.33. Founding badges section with chips. No streaming stats, no tip lines, no “demo” / “not a real payout” copy, no video reel. No tab bar.

### Screen: Thank-you card

Full-screen card from push. Soft gradient surface, artwork of Amaara Mensah, headline “Thank you, Efua”, body short artist message: “Your support helped me finish Asase. — Amaara”. Close X. Optional Share. Not a chat thread. No tab bar.

### Screen: Notification settings

Stack. Title “Notifications”. Grouped list `#393E46` cards: “New releases” toggle on, “Quiet hours” toggle on with time range 22:00–07:00. Section “Artists” — rows for each followed artist with mute switch (Amaara unmuted, Kweku muted). One screen only. No tab bar.

### Screen: Account settings

Stack. Title “Account”. Profile row: avatar Efua Boateng, name, Edit (opens avatar picker). Grouped rows: Change password; Subscription status “Supporter · $9.99/mo”; Restore purchases; Manage subscription with helper “Billing is managed in the App Store or Google Play”; Route support; Impact; Downloads; Notification settings; Request to become an artist with status chip “None” (show pending / approved / declined variants in notes); Sign out (destructive). No Family plan, no Find Friends, no gift cards. No tab bar.

### Screen: Change password

Stack. Current password, New password, Confirm. Primary “Save password” `#FFD369`. No tab bar.

### Screen: Request to become an artist

Stack from account. Title “Become an artist”. Short form: display name, bio, why. Primary “Submit request”. Status if pending shown at top. No tab bar.

---

## Mobile flow — Shared states (reference screens)

### Screen: Loading — Home skeleton

Same Home layout but grey shimmer blocks for post cards and rising row — no spinner centered on empty page. Tab bar visible.

### Screen: Empty — Library playlists

Library > Playlists empty: short copy “No playlists yet” and primary “Create playlist”. Tab bar visible.

### Screen: Error — feed

Home with inline error card “Couldn’t load updates” and “Try again” `#FFD369`. Tab bar visible.

### Screen: Offline banner on Home

Home content + thin frosted banner under header “Offline — playing downloads only. Follows will sync when you’re back.” Mini-player + tabs.

---

## Web flow — Artist Studio

Studio chrome on every studio screen except sign-in: left sidebar `#222831` border `#393E46` — wordmark Kindred, links Home, Releases, Upload, Updates, Supporters, Thank-yous, Earnings, Profile; footer Amaara Mensah / Artist. Main canvas `#222831`, panels `#393E46`.

### Screen: Studio sign in

Centered card `#393E46` on `#222831`. Wordmark, “Artist Studio”, Email, Password, “Sign in” `#FFD369`. No social. No sidebar.

### Screen: Studio home

Sidebar Home selected. Greeting “Good evening, Amaara” 28px. Metric row: Supporters 1,284; Scheduled 2; Thank-yous sent 6. Section Recent releases — 3 track cards with cover, title, status Published/Scheduled. Section Recent thank-yous — short list. Primary “Upload” `#FFD369`.

### Screen: Artist profile editor

Sidebar Profile. Fields: Display name, Bio, Avatar upload, Cover upload. Save `#FFD369`.

### Screen: Upload release

Sidebar Upload. Two columns: left dropzone “Drop audio (WAV/MP3)” + artwork dropzone; right form Title, Tags (copilot suggestion chips “highlife”, “accra” — artist can dismiss or keep), Description textarea with copilot “Suggestion” ghost text editable, Release note with copilot suggestion editable, Visibility radio Public / Supporters only, Publish now / Schedule with date-time picker. Progress “Generating peaks…” during upload (peaks never decoded on phones later). Primary “Publish” or “Schedule” `#FFD369`. Artist must be able to edit every suggestion before publish. No generate-a-song studio. No AI cover art.

### Screen: Releases list

Sidebar Releases. Table/grid: cover, title, visibility, status chips Scheduled / Published / Hidden, date. Row actions Edit, Hide. Filter tabs All / Scheduled / Published.

### Screen: Update composer

Sidebar Updates → Compose. Audience Everyone / Supporters only. Body text, attach Photo, attach Voice note (short audio control with record/stop). Primary “Post” `#FFD369`.

### Screen: Updates list

Sidebar Updates. List of past posts with audience chip, date, view.

### Screen: Supporters

Sidebar Supporters. Table: Name, Routing since, Founding yes/no. Efua Boateng · since 12 Aug 2026 · Founding.

### Screen: Fans to thank

Sidebar Thank-yous. Ranked shortlist with drafted one-liner editable. Primary “Send thank-you” per row. Big number “12 fans to thank” Clash Display.

### Screen: Earnings

Sidebar Earnings selected. Page title “Earnings”. Clash Display total “$482.00” with label “September” (or “This month”) — ordinary product copy, never “demo”, never “not a real payout”, never a disclaimer banner.

**What the numbers are (only this):** money from supporters’ monthly subscriptions who routed to Amaara. Formula shown in the UI as product facts, not caveats: each supporter’s plan contributes 70% to the artist pool (after store fees) and that pool is split equally across the artists they route; Amaara’s share is what appears here. Show “Store fees 30%” as a normal fee line, same as any app store cut — not labelled demo.

**Layout:** Top total for the selected month. Second row: two metrics only — “From supporters” (her share of routed pools) and “Store fees” (the 30% stand-in) — or a single total plus a short “How it’s calculated” panel with that 70/30 + equal-split copy. Below: breakdown by month table or list (Month · Supporters routed · Earnings). Optional simple chart of monthly totals from that same source only.

**Hard bans on this screen:** streaming payouts, play-count royalties, tips, tip jar, merch, donations, ad revenue, “illustrative only”, “demo earnings”, portfolio disclaimers, fake bank payout CTAs, Export report / download report buttons. Nothing that is not V1 routed-subscription earnings. Founding threshold elsewhere is under **100** supporters — do not invent 1,000.

---

## Web flow — Public pages

### Screen: Public artist page

No studio sidebar. Top bar Kindred wordmark + **Get the app** (not Sign in). Hero cover Amaara Mensah, **Get the app** primary for Follow/Support intent, Play for public tracks. Popular tracks list. Fixed bottom simple player: artwork, title, scrub/seek, play/pause, previous, next — no waveform craft, no visualizer, no download, no offline. Locked track shows lock + “Get the app to support”. No fan account chrome.

### Screen: Public track page

Share URL layout. Artwork, title, artist, Play if public; locked shell + Get the app if exclusive. Bottom simple player with seek + next/previous.

### Screen: Public post page

Post body (text, photo, or voice-note chip) if Everyone; locked shell + Get the app if Supporters only. Bottom player if public audio attached.

### Screen: Public mix page

Mix title, one-line why, track list, Play (public tracks only; locked rows show lock). Bottom simple player with seek.

### Screen: Public browse home (signed out)

Discovery rows Featured + Rising. Primary on artist cards is **Get the app** (not Follow). Search of public catalog. Bottom player. Banner CTA Get the app. No library lite that requires an account. No fan sign in.

### Screen: Install prompt

Banner or interstitial “Listen with the full Kindred app” + Open app / App Store / Play badges. Deep link handoff.

---

## Web flow — Admin

Sidebar: Requests, Artists, Catalog, Featured. Footer Delasi Mensah / Admin. Same dark shell.

### Screen: Pending artist requests

Table: Name, Email, Submitted, Actions Approve `#FFD369` / Decline destructive. Row for pending applicant.

### Screen: Artists list

Table: Artist, Verified toggle Verify/Unverify, Supporters, Actions.

### Screen: Catalog list

Table: Track, Artist, Visibility, Status, Hide / Remove actions.

### Screen: Featured discovery slots

Ordered list of featured artists/slots with drag reorder and Add. Save `#FFD369`.

---

## Suggested generation order

1. Set UX Pilot font ≈ Satoshi; color scheme primary `#FFD369`, background `#222831`, text `#EEEEEE`.
2. Paste Shared context for the flow.
3. Mobile tab roots first (Home, Discover, Search, Library) — check mini-player, pill tabs, Follow/Support hierarchy.
4. Then now-playing, queue, paywall, route — check waveform, both prices, Restore; no lyrics or tip jar.
5. Then Studio upload and earnings — check routed-subscription math only; no streaming/tips; no “demo” copy.
6. Prefer Edit Section for small fixes over regenerating whole flows.
