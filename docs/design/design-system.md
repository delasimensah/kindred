# Design system — Kindred (locked)

**Status:** locked 20 Sep 2026. Soft gold on cool charcoal. Do not change for V1 unless a ticket says so.

Grounded in [reference-map.md](./reference-map.md) and [product-requirements.md](../product/product-requirements.md). Hex from a published Color Hunt palette — not invented, not Apple red, not Spotify green.

Preview kept: [palette-previews/kindred-palette-locked.png](./palette-previews/kindred-palette-locked.png) (direction only). UX Pilot screens use the hex below plus Mobbin layout language — they should beat that rough preview.

Tokens also live in Shared context in [kindred-ux-pilot-flow-prompts.md](./kindred-ux-pilot-flow-prompts.md). Build copies them into `packages/shared` before first screens. Font load paths: [fonts.md](./fonts.md).

---

## Colors

**Source:** [Color Hunt — #222831 #393E46 #FFD369 #EEEEEE](https://colorhunt.co/palette/222831393e46ffd369eeeeee)

Cool charcoal page so artwork and liquid glass stay clean. Soft gold primary for Support / Follow / Play — warmer than teal, quieter than burnt orange.

- **Primary:** `#FFD369` — Support, Follow, Play, active tab, key links. Text on primary buttons is `#222831`.
- **Page:** `#222831` — app and studio canvas.
- **Surface:** `#393E46` — sheets, elevated rows, account cards, studio panels.
- **Text:** `#EEEEEE` primary. Secondary text is `#EEEEEE` at about 60% opacity.
- **Muted / border:** mix of `#393E46` and dimmed `#EEEEEE` — hairlines, inactive tabs, locked chip chrome. Do not invent a fifth brand hex.
- **Accent (founding / impact / money):** `#FFD369` on a `#393E46` chip, or outline gold.
- **Glass:** not a hex. iOS 26 uses `expo-glass-effect` (`GlassView`). Older iOS and Android use `expo-blur` over `#222831` / `#393E46`. Do not paint solid fake glass.
- **Destructive (remove download, decline):** platform red only (iOS system red / Material error). Not a brand color.
- **Web studio and admin:** same dark map as mobile. No light SaaS theme for V1.

Do not use Apple Music red, Spotify green, SoundCloud orange, teal `#00ADB5`, coffee-brown shells, or any Mobbin app’s brand hex.

---

## Typography

**Locked for Kindred V1.** Clash Display and Satoshi are from Fontshare (not Google Fonts). Keep them unless Clash Display becomes tedious to ship in Expo — then swap only the display face to a Google Font and update this section.

- **Display (now-playing title, impact big numbers, thank-you card, paywall headline):** Clash Display — SemiBold 600, Bold 700. Mobile 28–36px. Web studio metrics 32–40px. Source: [Fontshare — Clash Display](https://www.fontshare.com/fonts/clash-display).
- **UI (everywhere else):** Satoshi — Regular 400, Medium 500, SemiBold 600, Bold 700. Already in `apps/mobile-app/assets/fonts/`. Source: [Fontshare — Satoshi](https://www.fontshare.com/fonts/satoshi).
- **Mobile UI sizes:** titles 20–24px SemiBold/Bold; body 16px Regular; meta and row subtitles 13–14px Medium.
- **Web UI sizes:** page titles 28–32px Bold; sections 18–20px SemiBold; body 15–16px; tables 13–14px Medium.
- No Inter, Roboto, Arial, or unnamed system UI font in mockups.

---

## Layout

- **Mobile spacing:** list rows tight (8–12px inside a track row), sections breathe (20–24px). Now-playing is generous — large artwork, controls with room.
- **Web spacing:** studio is dense enough for upload lists (12–16px), with 24px between major blocks.
- **Corner radius:** artwork and cards 12px; buttons 12px; inputs 10px; pills and the floating mini-player / tab chrome fully rounded (capsule).
- **Shadows:** none on flat lists. Soft lift only under glass layers and the mini-player accessory. No heavy multi-layer drop shadows.
- **Touch targets:** at least 44px on mobile.

---

## Differentiator (exactly one)

**Dark mode** — cool charcoal page, light text, soft gold only on actions. Artwork and glass do the rest. Instantly distinct from default white AI SaaS output.

---

## Anti-style

- No purple, lavender, or blue–purple gradients.
- No cream page with terracotta accent (AI-template look).
- No Apple Music red, Spotify green, SoundCloud orange, or teal primary.
- No warm coffee-brown page fill (rejected in palette previews).
- No light white mobile shell pretending to be a music app.
- No fake solid “glass” rectangles with borders instead of real blur / `GlassView`.
- No lyrics panels, tip jars, social login buttons, 3D mascot illustrations, or cookie-cutter SaaS hero blocks.
- No “test user” copy. People have real names from seed.

---

## Navigation

**Mobile tabs (native tabs):** Home (feed), Discover, Search (`role="search"`), Library. Account opens from avatar / settings — not a fifth tab.

**Mini-player:** `NativeTabs.BottomAccessory` above the tab bar whenever audio is active.

**Web Artist Studio:** left sidebar + main (dark). Links: Home, Releases, Upload, Updates, Supporters, Thank-yous, Earnings, Profile.

**Public web / light player:** top wordmark, content, bottom light player bar. No purchase chrome.

**Admin:** same dark studio shell, thinner nav: Requests, Artists, Catalog, Featured.

---

## Product-specific

- Wordmark: **Kindred** (Clash Display or Satoshi Bold until a logo exists). No logo file yet.
- Money: USD `$4.99` and `$9.99` monthly. Same entitlements. Earnings and Impact use normal product labels (month, from supporters, store fees). No “demo”, “not a real payout”, or disclaimer banners in UI mockups or prompts.
- Copy tone: belonging and backing rising African artists — plain English, no influencer slang.
- Seed people and artwork use real-looking names (source/rights in the seed docs). Never “Artist 1”. Never put the word “demo” on screen chrome.
- Mobile is the craft bar. Android matches layout and actions; motion and glass may be softer.
- Web: no craft techniques, no offline, no purchase — get-the-app for paywall.

---

## Out of V1 design system

- Per-screen UX Pilot prompts (next).
- Logo mark (wordmark only until you supply one).
- A second light theme.
