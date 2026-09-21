# Screen reference map — Kindred

**Status:** locked 20 Sep 2026. 26 Mobbin keepers. Do not reopen keep/discard unless the product lock changes.

Maps each screen in [product-requirements.md](../product/product-requirements.md) §9 to Mobbin references. These are layout and chrome patterns. Do not copy brand colors, logos, or features that are out of the Kindred lock.

**Take:** Apple Music’s 2026 liquid glass chrome (frosted floating mini-player, pill tab bar, glass search field, full-bleed now-playing sheet). Music-app listening UX already in the lock: play, queue, shuffle, repeat, play next, library, playlists, search, downloads, reactions.

**Do not copy:** Apple red, Spotify green, SoundCloud orange. Lyrics, AutoMix, Family plan, music video, podcasts, CarPlay, TikTok-style vertical Discover, DJ chat, social login, tip jars.

---

## Visual language (the look)

Apple Music on current iOS is the craft bar. The chrome we want:

- Dark pages, large artwork, short track rows.
- A **pill tab bar** that floats above the home indicator.
- A **frosted mini-player** that sits on top of that bar, not glued to the bottom edge.
- Search as a glass field, not a boxed form.
- Now-playing as a sheet that grows out of the mini-player (shared-element motion later; this step is the stills).

Keepers that carry this chrome:

- [Apple Music library with glass mini-player and pill tabs](https://mobbin.com/screens/98264793-0d40-4f0f-93c9-c5ca32a2cb78)
- [Apple Music search with glass field](https://mobbin.com/screens/6e9cc18e-6337-481f-91c5-d7ab3f09c247)
- [Apple Music now-playing](https://mobbin.com/screens/b166b10a-4ed4-4ed1-8a8a-1446dad381a9)

Kindred is still a patronage app. Discovery and artist pages lead with **Follow**, then **Support**. Play is always there. It is not the only primary action.

---

## Expo build path

These screens are layouts we can ship on Kindred’s Expo 57 app, not Apple Music clones. Libraries below are either already in `apps/mobile-app` or are the ones the system design already named for later tickets (`expo-audio`, Skia). We do not invent a third stack.

**True liquid glass** is Apple’s frosted, light-bending material. Expo exposes it as `GlassView` in `expo-glass-effect`. It only runs on **iOS 26 and up**. On older iPhone and on Android it becomes a normal view, so those builds use `expo-blur` (`BlurView`) instead. That matches the product lock: iOS is the craft bar; Android is functional, not pixel-perfect. Both packages are installed in `apps/mobile-app` for the durable EAS client.

**Tab bar and mini-player (the Apple Music chrome)**

- Use Expo Router **native tabs**, not a fake tab bar drawn in JavaScript. On SDK 57 the import is `expo-router/unstable-native-tabs`. That is the pill glass bar in the keepers.
- Mini-player sits in `NativeTabs.BottomAccessory` (SDK 55+). That is Apple’s official slot above the tab bar, including the compact “inline” placement. Do not glue a custom bar to the bottom of every screen.
- Search tab uses `role="search"` plus the stack search bar. That is the glass search field. Do not design a custom search box that we then cannot put in the system tab bar.
- Tab bar can shrink on scroll (`minimizeBehavior="onScrollDown"`). Needs an EAS build compiled with **Xcode 26**.
- Expanding mini-player into now-playing stays the locked craft: Reanimated shared-element from the accessory artwork into a Gorhom sheet (`@gorhom/bottom-sheet` is already in the app). The accessory hosts normal React views, so Reanimated can measure them.

**Now-playing craft (already in the product lock)**

- Playback: `expo-audio` (background + lock screen). Installed in `apps/mobile-app`; wire on the player tickets.
- Waveform: `@shopify/react-native-skia`, drawn from stored peaks. Installed; use on the player craft tickets. Never decode audio on the phone.
- Visualizer: Skia runtime shader, default off in low power.
- Queue reorder: `react-native-gesture-handler` + Reanimated drag on a FlashList. No extra native module.

**Other mobile patterns**

- Track “Play Next” menu: `@expo/ui` SwiftUI `ContextMenu` on iOS. Android: a simple action sheet. Same actions, not the same chrome.
- Lists and grids: `@shopify/flash-list` (already in the app) — feed, library, follow-artists, route picker.
- Artwork: `expo-image` (already in the app).
- Paywall cards: our layout; purchase and Restore go through RevenueCat. Restore is a text control under the two plan cards, not a separate app’s paywall.
- Mix prompt: one `TextInput` and a submit. Not a chat. Mix result: playlist-style header, one-line why, play.
- Impact / thank-you cards: text, `expo-image`, `expo-linear-gradient` (already in the app).

**Web keepers (not Expo)**

- Spotify web player and TIDAL Upload stay for Artist Studio and the public site (Next.js). No liquid glass, no Skia, no shared-element on web. That is already in the lock.

**Out of these keepers, for Expo reasons**

- Do not design a JavaScript pill tab bar that copies Apple Music. Native tabs are the look.
- Do not design glass that must merge and morph on Android. `GlassContainer` merging is iOS 26 only.
- Do not design lyrics, AutoMix, or a DJ chat. Still out of the lock, and still not in this stack.

---

## Mobile — fan and supporter

**Sign up / sign in / sign out**

- [SiriusXM Welcome back](https://mobbin.com/screens/2cc2611f-603b-4327-88eb-c5e28648a58b) — email, password, one primary button. No Google / Apple / Facebook.
- Sign out is a row on account settings, not its own screen.

**Onboarding: genres, then follow at least two artists**

- [Apple Music genre mosaic](https://mobbin.com/screens/548b402d-4166-4705-9b59-988223bedbbf) — tap tiles, then continue.
- [YouTube Music follow artists](https://mobbin.com/screens/e89ef645-144c-43fc-a6ce-4772476c9372) — grid of faces, a count, continue. Their minimum is 5. Ours is 2.

**Home feed (followed-artist updates)**

- [SoundCloud Feed](https://mobbin.com/screens/f8984c3f-dbb9-47ee-ac9b-3a2c1be2cc1f) — artist posts in a list, not a vertical video feed.
- Locked supporters-only posts use the Patreon locked shell below, not a greyed row with no action.

**Discovery (rising + featured)**

- [Apple Music Ascending Artists](https://mobbin.com/screens/cbbe43ca-7694-4f53-bb8b-eda21570c869) — horizontal artist row, follow first. Not a global charts product.

**Search**

- [Apple Music search results](https://mobbin.com/screens/6e9cc18e-6337-481f-91c5-d7ab3f09c247) — one field, exact matches first. Semantic results sit under that, labelled. Build with native tabs `role="search"` and the stack search bar, not a custom glass `TextInput`.

**Artist profile**

- [Apple Music artist hero](https://mobbin.com/screens/9641ddc6-837c-44f6-a238-e68c527fc100) — cover, name, top songs, glass chrome.
- [Spotify artist](https://mobbin.com/screens/cd26e49b-2714-436f-85bd-ccd0ee3b9b3d) — Follow next to Play. Ignore Clips, Events, Merch.

**Track / post detail, including locked**

- [Patreon creator with Locked post](https://mobbin.com/screens/0376b09d-c2f1-4de0-acbf-476cd6d2f367) — hero, membership CTA, lock on the row. Kindred copy is Support, not Upgrade membership. No comment counts.

**Now-playing, mini-player, queue, play next**

- [Apple Music now-playing](https://mobbin.com/screens/b166b10a-4ed4-4ed1-8a8a-1446dad381a9) — artwork, controls, reactions. Reactions map to Kindred’s emoji set. Ignore lyrics if they appear.
- [Apple Music queue / Continue Playing](https://mobbin.com/screens/5c5c4c58-a6a3-4b2e-8f9c-aa13c6454c7f) — upcoming list, shuffle, repeat. Ignore AutoMix toast.
- [TIDAL queue reorder](https://mobbin.com/screens/9747b62c-b6c1-4e85-a9eb-4d2514acb24f) — drag handles to reorder / remove.
- [Apple Music Play / Play Next / Play After](https://mobbin.com/screens/73f2b851-60b7-40e5-8fe8-242352d374f2) — track context menu.
- Mini-player: same [library chrome](https://mobbin.com/screens/98264793-0d40-4f0f-93c9-c5ca32a2cb78). Waveform and shader are Kindred craft, not copied from these stills.

**Natural-language mix**

- [Suno prompt](https://mobbin.com/screens/b27284cd-8ebe-4a5f-9dd2-3086505b071a) — one box, describe the mix, one Create. Not a chat thread.
- Mix result: compose from [Spotify playlist detail](https://mobbin.com/screens/61af77a4-a534-4b48-b0ea-d440f7da6943) (header + play + track list) plus the one-line why under the title. No Familiar / Blend / Discover knobs.

**Library and playlists**

- [Apple Music library](https://mobbin.com/screens/98264793-0d40-4f0f-93c9-c5ca32a2cb78) — Playlists, Artists, Downloaded, Songs, with the glass mini-player.
- [Spotify playlist detail](https://mobbin.com/screens/61af77a4-a534-4b48-b0ea-d440f7da6943) — artwork header, play, track list. Locked rows stay in the list and look unplayable, not hidden.

**Downloads manager**

- [Spotify storage / downloads](https://mobbin.com/screens/598d91fd-86ef-4c34-99bc-e1c269f13685) — what is on the phone, size, remove. Ignore podcast-specific rows.

**Paywall ($4.99 and $9.99, same entitlements, restore)**

- [Apple Music subscribe cards](https://mobbin.com/screens/aab232d0-a5fb-4b6a-96fe-a1dd5b9fd420) — stacked plan cards over glass chrome. Ignore Family plan, lyrics, AutoMix copy. Two prices, same access. Restore is a text control under the cards.

**Route support (pick 1–5 followed artists)**

- [Weverse pick-artists grid](https://mobbin.com/screens/04ea3ed1-14ef-4e63-97c3-ff98563a4f70) — multi-select faces, a cap. Kindred adds equal-split copy and blocks unfollow until the artist is removed from the route set.

**Impact**

- [Apple Music Replay month stats](https://mobbin.com/screens/1c8aba2c-e279-4135-915d-05f977506724) — big number, then who it went to. Kindred numbers are this subscriber’s split, labelled as demo where they are demo.
- [Apple Music Replay milestones](https://mobbin.com/screens/ec5c8c61-7012-416a-b2b0-52ae8993d2f9) — badge chips for founding, not a video reel.

**Thank-you card (from a push)**

- [Apple Music Replay year card](https://mobbin.com/screens/920b2af5-cd88-482d-b480-4f0a6c1a288b) — one shareable card. The short line is the artist’s thank-you message, not year-in-review copy. This is not a chat.

**Notification settings**

- [Apple Music Notifications](https://mobbin.com/screens/05903a73-4c93-497c-b77a-12b96f1ec635) — one screen: grouped global toggles (including quiet hours), then a list of followed artists with mute. Not a second screen per artist.

**Account settings**

- [Apple Music Account](https://mobbin.com/screens/fa29e3c0-997f-4286-aa17-097554e7aea8) — avatar, grouped rows, manage subscription. Ignore Family plan, Find Friends, gift cards. Add: restore, request to become an artist, sign out.

---

## Artist Studio (web)

**Studio home / releases / upload**

- [TIDAL Upload](https://mobbin.com/screens/220dde32-728a-4b80-a20c-709a239afcb8) — dark studio, track list, + Upload, published vs unpublished. Ignore Spotlight ads.

**Public artist page (also the public web artist page)**

- [Spotify web artist + bottom player](https://mobbin.com/screens/dad530d5-31f8-4f63-b0c5-724f98bb1dbe) — hero, popular tracks, library sidebar, light player on the bottom edge. No purchase, no offline, no waveform shader on web.

**Update composer / supporters / thank-yous / earnings**

- Compose from TIDAL studio density plus Replay-style big numbers for earnings and fans-to-thank. Do not use Suno’s generate-a-song studio.

**Studio sign in**

- Same SiriusXM email pattern as mobile.

---

## Public web

- Artist / track / mix pages: same [Spotify web artist](https://mobbin.com/screens/dad530d5-31f8-4f63-b0c5-724f98bb1dbe).
- Locked exclusive: same [Patreon locked](https://mobbin.com/screens/0376b09d-c2f1-4de0-acbf-476cd6d2f367) shell, with get-the-app as the CTA on web.

---

## Admin (thin web)

Same dense list + row actions as Studio releases (TIDAL upload list). Approve / decline, verify, hide, featured order. Not a second product look.

---

## Shared states

- Loading: skeletons in the shape of the real rows (Apple Music library / search).
- Empty: one next action (follow artists, start a mix). Seeded demo accounts never show an empty feed.
- Locked: [Patreon locked post](https://mobbin.com/screens/0376b09d-c2f1-4de0-acbf-476cd6d2f367), not an error.
- Offline banner: no keeper. Compose a thin glass bar above the mini-player.

---

## Discarded on purpose

- Apple Music Charts — chrome already covered by library and search; Kindred is not a charts product.
- YouTube Music mix filters — Familiar / Blend / Discover are wrong; mix result is playlist + one-line why.
- Lóvi Unlock Premium — Restore is a text control under our plan cards, not a fitness paywall.
- Spotify lyrics-first now-playing, Apple Music lyrics, AutoMix, Family plan, radio / LIVE.
- SoundCloud TikTok-style Discover, music video, podcasts, skip-30s.
- Suno / ElevenLabs / Artlist generate-a-song studios (except the one Suno prompt box).
- Epidemic Sound catalog, Spotify Kids, social login screens.
- Patreon tip jar and $5/mo form as the Kindred paywall.
- Boomplay and Audiomack: not in Mobbin’s index.

---

## Locked gap defaults

- **Route support picker:** Weverse grid, with equal-split copy and a 5-cap in our UI.
- **Per-artist mute + quiet hours:** one settings screen — global toggles, then followed artists with mute.
- **Artist Studio earnings / fans to thank:** Replay-style big numbers on the dark TIDAL studio page.
- **Thank-you:** Replay card shape; the short line is the artist’s message.

---

## Count

26 unique Mobbin screens. Chrome source is Apple Music. Feed and locked exclusive come from SoundCloud and Patreon because Apple Music has no patronage posts.
