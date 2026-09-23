# Linear tickets — Kindred

Build order for this product. Issues live on Linear team [Kindred](https://linear.app/dm-studios/team/KIND) (`KIND`). Assigned to Delasi Mensah.

Projects:

- [First Version](https://linear.app/dm-studios/project/first-version-b77af5da5c54) — product slices
- [Launch](https://linear.app/dm-studios/project/launch-bf19c836603c) — TestFlight and Play

Screen HTML lives in `docs/design/exports/`. Each issue body links the exports for that journey. Rebuild with this repo’s components. Do not paste UX Pilot markup into the app.

**Web:** every UI ticket requires usable layout at ~375px and 1280px+ even when the export is desktop-framed.

**Mobile:** use Expo libraries; liquid glass via `expo-glass-effect` / `expo-blur` as designed. Before implementing, check official Expo (and library) docs; cite them in the PR.

Implement one issue at a time. Branch `feature/KIND-n`. Canceled issues KIND-14–KIND-41 stay canceled — do not revive them.

Build order follows the product, not the epic list: mobile catalog and listening first, then Artist Studio web, then public pages. Do not jump phone → web → phone. **KIND-50** tab shell, **KIND-53** Discover, and **KIND-51** artist and track are Done. Next phone catalog slice is **KIND-52** Library. **KIND-45** (web Studio sign-in) stays Todo until the phone catalog screens are in place.

A phone slice is not Done if the fan cannot open it by tapping through the app. Do not ship a detail screen before the tab or list that opens it.

**Words we use on purpose:** A **short check** is a small try before the full feature (old docs said “spike”). We learn works / blocked / cut later. The **retry queue** (old docs said “outbox”) is the phone’s saved list of taps that could not reach the server while offline, sent when you are back online.

KIND-46 (password email short check) is on **Backlog** until email sending is ready.

---

## Status now

Board flow: **Todo → In Progress → Done**. Backlog is later work only.

- Epics KIND-1–KIND-13 exist and stay open until children are Done.
- Premature slices KIND-14–KIND-41 are **Canceled** (pre-screens). Left untouched.
- **KIND-42** shared design tokens is **Done**.
- **KIND-43** mobile email/password auth is **Done**.
- **KIND-44** onboarding genres and follows is **Done**.
- **KIND-45** web Studio/admin sign-in is **Todo** (deferred until after mobile catalog, seed, and shell).
- **KIND-49** catalog schema is **Done**.
- **KIND-48** catalog seed is **Done**.
- **KIND-50** mobile tab shell is **Done**.
- **KIND-53** Discover is **Done**.
- **KIND-51** artist profile and track detail is **Done**.
- Remaining First Version / Launch slices **KIND-47**, **KIND-52**, and **KIND-54–KIND-88** are **Todo** (KIND-46 Backlog). KIND-45 is Todo but not next.
- Do not move a slice to In Progress until you ask to start it.
- Phone catalog order after the shell: [KIND-53](https://linear.app/dm-studios/issue/KIND-53) Discover (Done) → [KIND-51](https://linear.app/dm-studios/issue/KIND-51) artist and track (Done) → [KIND-52](https://linear.app/dm-studios/issue/KIND-52) Library → player work → [KIND-57](https://linear.app/dm-studios/issue/KIND-57) Home feed. KIND-45 stays Todo until those screens are in place.
- Next build slice: [KIND-52](https://linear.app/dm-studios/issue/KIND-52) (Library destinations, liked songs, and private playlists).

---

## Epics

- [KIND-1 Epic: Foundations and auth](https://linear.app/dm-studios/issue/KIND-1) — parent for children below
- [KIND-2 Epic: Catalog and seed](https://linear.app/dm-studios/issue/KIND-2) — parent for children below
- [KIND-3 Epic: Player and queue](https://linear.app/dm-studios/issue/KIND-3) — parent for children below
- [KIND-4 Epic: Craft techniques](https://linear.app/dm-studios/issue/KIND-4) — parent for children below
- [KIND-5 Epic: Connection](https://linear.app/dm-studios/issue/KIND-5) — parent for children below
- [KIND-6 Epic: Money](https://linear.app/dm-studios/issue/KIND-6) — parent for children below
- [KIND-7 Epic: Push and deep links](https://linear.app/dm-studios/issue/KIND-7) — parent for children below
- [KIND-8 Epic: Offline](https://linear.app/dm-studios/issue/KIND-8) — parent for children below
- [KIND-9 Epic: Search, mix, and remaining craft](https://linear.app/dm-studios/issue/KIND-9) — parent for children below
- [KIND-10 Epic: Artist Studio](https://linear.app/dm-studios/issue/KIND-10) — parent for children below
- [KIND-11 Epic: Artist request and admin](https://linear.app/dm-studios/issue/KIND-11) — parent for children below
- [KIND-12 Epic: Public web](https://linear.app/dm-studios/issue/KIND-12) — parent for children below
- [KIND-13 Epic: Launch](https://linear.app/dm-studios/issue/KIND-13) — parent for children below

---

## Ordered build list

1. [KIND-42](https://linear.app/dm-studios/issue/KIND-42/shared-design-tokens-match-the-locked-kindred-palette-and-type) **Shared design tokens match the locked Kindred palette and type** — Slice. Epic KIND-1. Apps: shared. Design: docs/design/design-system.md
2. [KIND-43](https://linear.app/dm-studios/issue/KIND-43/fan-can-sign-up-sign-in-and-sign-out-on-mobile-with-email-and-password) **Fan can sign up, sign in, and sign out on mobile with email and password** — Slice. Epic KIND-1. Apps: mobile, convex. Design: docs/design/exports/mobile/01-auth/00-welcome.html, docs/design/exports/mobile/01-auth/01-sign-in.html, docs/design/exports/mobile/01-auth/02-sign-up.html
3. [KIND-44](https://linear.app/dm-studios/issue/KIND-44/new-fan-picks-genres-and-follows-at-least-two-artists-before) **New fan picks genres and follows at least two artists before continuing** — Slice. Epic KIND-1. Apps: mobile, convex. Design: docs/design/exports/mobile/01-auth/03-onboarding-genres.html, docs/design/exports/mobile/01-auth/04-onboarding-follow-artists.html
4. [KIND-45](https://linear.app/dm-studios/issue/KIND-45/verified-artist-or-admin-can-sign-in-to-web-studio-or-admin) **Verified artist or admin can sign in to web Studio or admin** — Slice. Epic KIND-1. Apps: web, convex. Design: docs/design/exports/web/01-studio/01-sign-in.html
5. [KIND-46](https://linear.app/dm-studios/issue/KIND-46/spike-password-reset-email-otp-end-to-end) **Spike: password reset email OTP end to end** — Spike. Epic KIND-1. Apps: mobile, web, convex. Design: (no screen — spike/infra)
6. [KIND-47](https://linear.app/dm-studios/issue/KIND-47/signed-in-fan-can-change-password-from-mobile-account-settings) **Signed-in fan can change password from mobile account settings** — Slice. Epic KIND-1. Apps: mobile, convex. Design: docs/design/exports/mobile/07-settings/03-change-password.html, docs/design/exports/mobile/07-settings/02-account-settings.html
7. [KIND-49](https://linear.app/dm-studios/issue/KIND-49/convex-catalog-schema-for-artists-tracks-files-and-peaks) **Convex catalog schema for artists, tracks, files, and peaks** — Slice. Epic KIND-2. Apps: convex. Design: (no screen — spike/infra)
8. [KIND-48](https://linear.app/dm-studios/issue/KIND-48/seed-pipeline-loads-artists-tracks-with-peaks-and-demo-logins) **Seed pipeline loads artists, tracks with peaks, and demo logins** — Slice. Epic KIND-2. Apps: convex. Design: (no screen — spike/infra)
9. [KIND-50](https://linear.app/dm-studios/issue/KIND-50/mobile-app-shell-liquid-glass-tab-bar-and-mini-player-chrome) **Mobile app shell: liquid-glass tab bar and mini-player chrome** — Slice. Epic KIND-2. Apps: mobile. Design: docs/design/exports/mobile/02-tabs/01-home.html
10. [KIND-53](https://linear.app/dm-studios/issue/KIND-53/fan-can-browse-discover-featured-and-rising-artists) **Fan can browse Discover featured and rising artists** — Slice. Epic KIND-2. Apps: mobile, convex. Design: docs/design/exports/mobile/02-tabs/02-discover.html
11. [KIND-51](https://linear.app/dm-studios/issue/KIND-51/fan-can-open-artist-profile-and-track-detail-locked-and-unlocked) **Fan can open artist profile and track detail (locked and unlocked)** — Slice. Epic KIND-2. Apps: mobile, convex. Design: docs/design/exports/mobile/03-library/04-artist-profile.html, docs/design/exports/mobile/03-library/05-track-detail-unlocked.html
12. [KIND-52](https://linear.app/dm-studios/issue/KIND-52/fan-can-use-library-destinations-liked-songs-and-private-playlists) **Fan can use Library destinations, liked songs, and private playlists** — Slice. Epic KIND-2. Apps: mobile, convex. Design: docs/design/exports/mobile/02-tabs/04-library.html, docs/design/exports/mobile/03-library/01-playlists.html
13. [KIND-54](https://linear.app/dm-studios/issue/KIND-54/spike-background-audio-and-lock-screen-controls-on-a-real-device) **Spike: background audio and lock-screen controls on a real device** — Spike. Epic KIND-3. Apps: mobile. Design: (no screen — spike/infra)
14. [KIND-55](https://linear.app/dm-studios/issue/KIND-55/fan-can-play-music-with-queue-shuffle-repeat-nextprevious) **Fan can play music with queue, shuffle, repeat, next/previous** — Slice. Epic KIND-3. Apps: mobile, convex. Design: docs/design/exports/mobile/04-player/01-now-playing.html, docs/design/exports/mobile/04-player/02-queue.html
15. [KIND-56](https://linear.app/dm-studios/issue/KIND-56/mini-player-shared-transition-and-skia-waveform-scrubber-on-real) **Mini-player shared transition and Skia waveform scrubber on real screens** — Slice. Epic KIND-4. Apps: mobile. Design: docs/design/exports/mobile/04-player/01-now-playing.html
16. [KIND-57](https://linear.app/dm-studios/issue/KIND-57/fan-can-follow-artists-see-home-feed-updates-and-react-to-tracks) **Fan can follow artists, see Home feed updates, and react to tracks** — Slice. Epic KIND-5. Apps: mobile, convex. Design: docs/design/exports/mobile/02-tabs/01-home.html
17. [KIND-58](https://linear.app/dm-studios/issue/KIND-58/spike-presence-heartbeat-and-ttl-on-two-devices) **Spike: presence heartbeat and TTL on two devices** — Spike. Epic KIND-5. Apps: mobile, convex. Design: (no screen — spike/infra)
18. [KIND-59](https://linear.app/dm-studios/issue/KIND-59/artist-page-shows-approximate-live-listener-count) **Artist page shows approximate live listener count** — Slice. Epic KIND-5. Apps: mobile, convex. Design: docs/design/exports/mobile/03-library/04-artist-profile.html
19. [KIND-60](https://linear.app/dm-studios/issue/KIND-60/spike-push-notification-cold-start-on-physical-devices) **Spike: push notification cold start on physical devices** — Spike. Epic KIND-7. Apps: mobile. Design: (no screen — spike/infra)
20. [KIND-61](https://linear.app/dm-studios/issue/KIND-61/spike-universal-links-open-the-right-screen-from-cold) **Spike: universal links open the right screen from cold** — Spike. Epic KIND-7. Apps: mobile, web. Design: (no screen — spike/infra)
21. [KIND-62](https://linear.app/dm-studios/issue/KIND-62/fan-gets-release-push-with-mute-and-quiet-hours) **Fan gets release push with mute and quiet hours** — Slice. Epic KIND-7. Apps: mobile, convex. Design: docs/design/exports/mobile/07-settings/01-notification-settings.html, docs/design/exports/mobile/06-money/04-thank-you-card.html
22. [KIND-63](https://linear.app/dm-studios/issue/KIND-63/spike-revenuecat-webhook-and-sandbox-purchase-write-convex-entitlement) **Spike: RevenueCat webhook and sandbox purchase write Convex entitlement** — Spike. Epic KIND-6. Apps: mobile, convex. Design: (no screen — spike/infra)
23. [KIND-64](https://linear.app/dm-studios/issue/KIND-64/fan-can-buy-supporter-subscription-and-restore-after-reinstall) **Fan can buy Supporter subscription and restore after reinstall** — Slice. Epic KIND-6. Apps: mobile, convex. Design: docs/design/exports/mobile/06-money/01-paywall.html
24. [KIND-65](https://linear.app/dm-studios/issue/KIND-65/supporter-can-route-1-5-artists-and-unlock-exclusives-only-for-them) **Supporter can route 1–5 artists and unlock exclusives only for them** — Slice. Epic KIND-6. Apps: mobile, convex. Design: docs/design/exports/mobile/06-money/02-route-support.html
25. [KIND-66](https://linear.app/dm-studios/issue/KIND-66/supporter-can-see-impact-breakdown-and-founding-badges) **Supporter can see Impact breakdown and founding badges** — Slice. Epic KIND-6. Apps: mobile, convex. Design: docs/design/exports/mobile/06-money/03-impact.html
26. [KIND-67](https://linear.app/dm-studios/issue/KIND-67/account-settings-show-subscription-status-restore-and-manage) **Account settings show subscription status, restore, and manage-subscription help** — Slice. Epic KIND-6. Apps: mobile. Design: docs/design/exports/mobile/07-settings/02-account-settings.html
27. [KIND-68](https://linear.app/dm-studios/issue/KIND-68/spike-offline-download-airplane-play-and-outbox-replay) **Spike: offline download, airplane play, and outbox replay** — Spike. Epic KIND-8. Apps: mobile. Design: (no screen — spike/infra)
28. [KIND-69](https://linear.app/dm-studios/issue/KIND-69/supporter-can-download-entitled-tracks-and-manage-downloads) **Supporter can download entitled tracks and manage downloads** — Slice. Epic KIND-8. Apps: mobile, convex. Design: docs/design/exports/mobile/03-library/09-downloads.html, docs/design/exports/mobile/08-shared-states/04-home-offline.html
29. [KIND-70](https://linear.app/dm-studios/issue/KIND-70/spike-vector-embeddings-return-sensible-neighbours) **Spike: vector embeddings return sensible neighbours** — Spike. Epic KIND-9. Apps: convex. Design: (no screen — spike/infra)
30. [KIND-71](https://linear.app/dm-studios/issue/KIND-71/fan-can-search-exact-matches-first-then-semantic-results) **Fan can search exact matches first then semantic results** — Slice. Epic KIND-9. Apps: mobile, convex. Design: docs/design/exports/mobile/02-tabs/03-search.html
31. [KIND-72](https://linear.app/dm-studios/issue/KIND-72/fan-can-generate-a-natural-language-mix-and-play-it) **Fan can generate a natural-language mix and play it** — Slice. Epic KIND-9. Apps: mobile, convex. Design: docs/design/exports/mobile/05-mix/01-make-a-mix.html, docs/design/exports/mobile/05-mix/02-mix-result.html
32. [KIND-73](https://linear.app/dm-studios/issue/KIND-73/visualizer-toggle-and-ios-quality-sheet-stack-on-real-screens) **Visualizer toggle and iOS-quality sheet stack on real screens** — Slice. Epic KIND-4. Apps: mobile. Design: docs/design/exports/mobile/04-player/01-now-playing.html
33. [KIND-74](https://linear.app/dm-studios/issue/KIND-74/spike-browser-peak-generation-for-artist-upload) **Spike: browser peak generation for artist upload** — Spike. Epic KIND-10. Apps: web. Design: (no screen — spike/infra)
34. [KIND-75](https://linear.app/dm-studios/issue/KIND-75/spike-scheduled-publish-fires-on-time) **Spike: scheduled publish fires on time** — Spike. Epic KIND-10. Apps: convex. Design: (no screen — spike/infra)
35. [KIND-76](https://linear.app/dm-studios/issue/KIND-76/spike-ai-upload-copilot-and-thank-you-fixtures) **Spike: AI upload copilot and thank-you fixtures** — Spike. Epic KIND-10. Apps: convex. Design: (no screen — spike/infra)
36. [KIND-77](https://linear.app/dm-studios/issue/KIND-77/spike-web-voice-notes-on-safari) **Spike: web voice notes on Safari** — Spike. Epic KIND-10. Apps: web. Design: (no screen — spike/infra)
37. [KIND-78](https://linear.app/dm-studios/issue/KIND-78/artist-can-use-studio-home-and-edit-profile-on-web) **Artist can use Studio home and edit profile on web** — Slice. Epic KIND-10. Apps: web, convex. Design: docs/design/exports/web/01-studio/02-home.html, docs/design/exports/web/01-studio/03-profile.html
38. [KIND-79](https://linear.app/dm-studios/issue/KIND-79/artist-can-upload-and-schedule-releases-with-peaks-and-visibility) **Artist can upload and schedule releases with peaks and visibility** — Slice. Epic KIND-10. Apps: web, convex. Design: docs/design/exports/web/01-studio/04-upload-release.html, docs/design/exports/web/01-studio/05-releases.html
39. [KIND-81](https://linear.app/dm-studios/issue/KIND-81/artist-can-post-updates-textphotovoice-and-list-them) **Artist can post updates (text/photo/voice) and list them** — Slice. Epic KIND-10. Apps: web, convex. Design: docs/design/exports/web/01-studio/06-update-composer.html, docs/design/exports/web/01-studio/07-updates.html
40. [KIND-80](https://linear.app/dm-studios/issue/KIND-80/artist-can-see-supporters-thank-fans-and-view-earnings) **Artist can see supporters, thank fans, and view earnings** — Slice. Epic KIND-10. Apps: web, convex. Design: docs/design/exports/web/01-studio/08-supporters.html, docs/design/exports/web/01-studio/09-fans-to-thank.html
41. [KIND-82](https://linear.app/dm-studios/issue/KIND-82/fan-can-request-to-become-an-artist-from-mobile-account-settings) **Fan can request to become an artist from mobile account settings** — Slice. Epic KIND-11. Apps: mobile, convex. Design: docs/design/exports/mobile/07-settings/04-request-to-become-an-artist.html, docs/design/exports/mobile/07-settings/02-account-settings.html
42. [KIND-83](https://linear.app/dm-studios/issue/KIND-83/admin-can-approve-or-decline-artist-requests-and-verify-artists) **Admin can approve or decline artist requests and verify artists** — Slice. Epic KIND-11. Apps: web, convex. Design: docs/design/exports/web/03-admin/01-requests.html, docs/design/exports/web/03-admin/02-artists.html
43. [KIND-84](https://linear.app/dm-studios/issue/KIND-84/admin-can-hide-or-remove-catalog-items-and-set-featured-slots) **Admin can hide or remove catalog items and set featured slots** — Slice. Epic KIND-11. Apps: web, convex. Design: docs/design/exports/web/03-admin/03-catalog.html, docs/design/exports/web/03-admin/04-featured.html
44. [KIND-85](https://linear.app/dm-studios/issue/KIND-85/public-artisttrackpostmix-pages-play-public-audio-and-lock-exclusives) **Public artist/track/post/mix pages play public audio and lock exclusives** — Slice. Epic KIND-12. Apps: web, convex. Design: docs/design/exports/web/02-public/02-artist-page.html, docs/design/exports/web/02-public/03-track-page.html
45. [KIND-86](https://linear.app/dm-studios/issue/KIND-86/public-browse-home-and-install-prompt-with-deep-link-handoff) **Public browse home and install prompt with deep-link handoff** — Slice. Epic KIND-12. Apps: web. Design: docs/design/exports/web/02-public/01-browse-home.html, docs/design/exports/web/02-public/06-install-prompt.html
46. [KIND-88](https://linear.app/dm-studios/issue/KIND-88/shipped-screens-show-loading-empty-and-error-states) **Shipped screens show loading, empty, and error states** — Slice. Epic KIND-2. Apps: mobile, web. Design: docs/design/exports/mobile/08-shared-states/01-home-loading-skeleton.html, docs/design/exports/mobile/08-shared-states/02-playlists-empty.html
47. [KIND-87](https://linear.app/dm-studios/issue/KIND-87/testflight-play-closed-testing-access-list-and-90-second-demo-script) **TestFlight, Play closed testing, ACCESS-LIST, and 90-second demo script** — Slice. Epic KIND-13. Apps: mobile, web. Design: (no screen — spike/infra)

---

## Issue bodies

Identifiers: see `_linear-id-map.json` (slug → KIND-n).

### Shared design tokens match the locked Kindred palette and type

**Linear:** [KIND-42](https://linear.app/dm-studios/issue/KIND-42/shared-design-tokens-match-the-locked-kindred-palette-and-type)

**Epic:** KIND-1  
**Project:** First Version  
**Apps:** shared

**Goal:** Ship Kindred colors, radii, and font tokens in packages/shared so web and mobile cannot drift.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/design-system.md`

**Acceptance:**

- packages/shared exports page #222831, surface #393E46, primary #FFD369, text #EEEEEE (and documented secondary opacity).
- Web Tailwind/Mantine and mobile NativeWind (or equivalent) consume those tokens — not hard-coded one-off hex in new screens.
- Clash Display and Satoshi loading paths are documented for mobile (Fontshare files) and web.
- A short note in the PR lists which shared files hold tokens.

**Do not:**

- Do not build product screens in this ticket.
- Do not invent a fifth brand color.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can sign up, sign in, and sign out on mobile with email and password

**Linear:** [KIND-43](https://linear.app/dm-studios/issue/KIND-43/fan-can-sign-up-sign-in-and-sign-out-on-mobile-with-email-and-password)

**Epic:** KIND-1  
**Project:** First Version  
**Apps:** mobile, convex

**Goal:** A person creates an account and signs in on the Expo app only. No social login.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/01-auth/00-welcome.html`
- `docs/design/exports/mobile/01-auth/01-sign-in.html`
- `docs/design/exports/mobile/01-auth/02-sign-up.html`

**Acceptance:**

- Signed-out user can open Sign up, create an account with email + password, and land in the app session.
- Signed-out user can Sign in with that email + password.
- Signed-in user can Sign out and must sign in again to use account surfaces.
- No Google/Apple/Facebook buttons on these screens.
- Profile row exists in Convex for the signed-in user.
- Unit/integration coverage for happy path auth helpers used by this flow.

**Do not:**

- Do not build web fan auth.
- Do not add Forgot password until the password-reset spike passes.
- Do not add onboarding in this ticket.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### New fan picks genres and follows at least two artists before continuing

**Linear:** [KIND-44](https://linear.app/dm-studios/issue/KIND-44/new-fan-picks-genres-and-follows-at-least-two-artists-before)

**Epic:** KIND-1  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** mobile-auth

**Goal:** After first sign-up, onboarding collects genres then follows (min two) before the main tabs.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/01-auth/03-onboarding-genres.html`
- `docs/design/exports/mobile/01-auth/04-onboarding-follow-artists.html`

**Acceptance:**

- User can select one or more genres; Continue stays disabled until at least one genre is selected.
- User can follow artists; Continue stays disabled until at least two follows exist.
- Selections persist for that profile.
- Tab roots are not usable as the home experience until onboarding is complete.

**Do not:**

- Do not skip the two-artist minimum.
- Do not require purchase.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Verified artist or admin can sign in to web Studio or admin

**Linear:** [KIND-45](https://linear.app/dm-studios/issue/KIND-45/verified-artist-or-admin-can-sign-in-to-web-studio-or-admin)

**Epic:** KIND-1  
**Project:** First Version  
**Apps:** web, convex

**Goal:** Web auth is Studio/admin only. Responsive.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/01-studio/01-sign-in.html`

**Acceptance:**

- Artist/admin can sign in with email + password on web.
- Fan accounts without artist/admin privileges cannot use Studio routes (clear refusal).
- Layout usable at ~375px width and at 1280px+.
- No fan sign-up or fan account settings on web.

**Do not:**

- Do not add fan web auth.
- Do not add social login.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: password reset email OTP end to end

**Linear:** [KIND-46](https://linear.app/dm-studios/issue/KIND-46/spike-password-reset-email-otp-end-to-end)

**Epic:** KIND-1  
**Project:** First Version  
**Apps:** mobile, web, convex

**Goal:** Timeboxed spike. Written outcome: works / blocked / cut to Later.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Attempt Convex Auth password reset OTP with a transactional email provider on at least one client.
- Written result committed (ticket comment or short doc note): works, blocked, or cut to Later with the fallback (signed-in change password + admin/demo reset).

**Do not:**

- Do not ship Forgot password UI until this spike says works.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Signed-in fan can change password from mobile account settings

**Linear:** [KIND-47](https://linear.app/dm-studios/issue/KIND-47/signed-in-fan-can-change-password-from-mobile-account-settings)

**Epic:** KIND-1  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** mobile-auth

**Goal:** Signed-in change password works regardless of Forgot-password spike.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/07-settings/03-change-password.html`
- `docs/design/exports/mobile/07-settings/02-account-settings.html`

**Acceptance:**

- From Account settings, user opens Change password, submits current + new + confirm, and can sign in with the new password.
- Wrong current password shows a clear error and does not change credentials.

**Do not:**

- Do not add Forgot password here unless spike-password-reset passed and a separate ticket exists.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Convex catalog schema for artists, tracks, files, and peaks

**Linear:** [KIND-49](https://linear.app/dm-studios/issue/KIND-49/convex-catalog-schema-for-artists-tracks-files-and-peaks)

**Epic:** KIND-2  
**Project:** First Version  
**Apps:** convex

**Goal:** Tables and indexes for catalog exist so seed and UI can attach.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Schema covers artists, tracks (incl peaks array field), storage file refs, and relations needed for library lists.
- Generated types available to apps.
- No public audio URLs in list queries.

**Do not:**

- Do not build full seed world yet.
- Do not build player.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Seed pipeline loads artists, tracks with peaks, and demo logins

**Linear:** [KIND-48](https://linear.app/dm-studios/issue/KIND-48/seed-pipeline-loads-artists-tracks-with-peaks-and-demo-logins)

**Epic:** KIND-2  
**Project:** First Version  
**Apps:** convex  
**Blocked by (slugs until Linear ids exist):** schema-catalog

**Goal:** Runnable seed creates the Accra/Lagos cast world with peaks and ACCESS-LIST-ready logins.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Seed script (documented command) creates artists, tracks with peaks, artwork/audio files, and named demo accounts (fan, supporter, artist, admin).
- Rights/credit notes for seed audio/images live with the seed docs.
- Re-running seed is idempotent or clearly documented wipe+seed.

**Do not:**

- Do not use names like test user or Artist 1.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Mobile app shell: liquid-glass tab bar and mini-player chrome

**Linear:** [KIND-50](https://linear.app/dm-studios/issue/KIND-50/mobile-app-shell-liquid-glass-tab-bar-and-mini-player-chrome)

**Epic:** KIND-2  
**Project:** First Version  
**Apps:** mobile  
**Blocked by (slugs until Linear ids exist):** tokens, mobile-auth

**Goal:** Four tabs (Home, Discover, Search, Library) with floating pill tab bar using expo-glass-effect / expo-blur per platform capability; mini-player slot present.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/02-tabs/01-home.html`

**Acceptance:**

- Tab bar matches design system: floating pill, soft gold active tint, four tabs only (no Account tab).
- Implementation checks current Expo docs for expo-glass-effect and expo-blur and cites them in the PR.
- Mini-player accessory slot exists (can be empty until player ticket).
- Account is reachable from avatar/settings, not a fifth tab.

**Do not:**

- Do not fake glass with only a bordered solid box.
- Do not add Account as a tab.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can open artist profile and track detail (locked and unlocked)

**Linear:** [KIND-51](https://linear.app/dm-studios/issue/KIND-51/fan-can-open-artist-profile-and-track-detail-locked-and-unlocked)

**Epic:** KIND-2  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** seed, mobile-shell-glass

**Goal:** Catalog browse for seeded artists/tracks with honest locked shells.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/03-library/04-artist-profile.html`
- `docs/design/exports/mobile/03-library/05-track-detail-unlocked.html`
- `docs/design/exports/mobile/03-library/06-track-detail-locked.html`

**Acceptance:**

- Signed-in fan can open a seeded artist profile from Discover. The profile stays on the Discover stack, so the tab bar stays. Loading uses a skeleton of the screen, not a text placeholder.
- The profile shows a short popular-track list. View all opens the rest of that list on the same stack. A public row plays in place (mini player title and pause). A supporters-only row opens the lock shell and Support call to action. Support does not check out.
- No audio URL leaked in list responses. Playback itself is a later slice.

**Do not:**

- Do not implement purchase in this ticket.
- Do not add comments.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can use Library destinations, liked songs, and private playlists

**Linear:** [KIND-52](https://linear.app/dm-studios/issue/KIND-52/fan-can-use-library-destinations-liked-songs-and-private-playlists)

**Epic:** KIND-2  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** artist-track-ui

**Goal:** Library hub + playlists + liked + followed artists list.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/02-tabs/04-library.html`
- `docs/design/exports/mobile/03-library/01-playlists.html`
- `docs/design/exports/mobile/03-library/02-create-playlist.html`
- `docs/design/exports/mobile/03-library/07-playlist-detail.html`
- `docs/design/exports/mobile/03-library/08-liked-songs.html`
- `docs/design/exports/mobile/03-library/03-library-artists.html`

**Acceptance:**

- Library tab lists destinations: Playlists, Liked, Downloads (can deep-link empty), Artists, Make a mix (can stub navigate).
- User can create a private playlist, open it, and add/remove tracks.
- Liked songs list works for the signed-in profile.
- Library artists lists followed artists.
- Locked tracks in a playlist show as locked, not playable.

**Do not:**

- Do not build downloads playback here.
- Do not make playlists public.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can browse Discover featured and rising artists

**Linear:** [KIND-53](https://linear.app/dm-studios/issue/KIND-53/fan-can-browse-discover-featured-and-rising-artists)

**Epic:** KIND-2  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** seed, mobile-shell-glass

**Goal:** Discover shows featured slots and rising list; Follow is primary.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/02-tabs/02-discover.html`

**Acceptance:**

- Discover tab shows Featured and Rising sections from Convex data (seeded).
- Follow action works from Discover cards.
- Play is not the primary CTA on artist cards.

**Do not:**

- Do not add web Follow.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: background audio and lock-screen controls on a real device

**Linear:** [KIND-54](https://linear.app/dm-studios/issue/KIND-54/spike-background-audio-and-lock-screen-controls-on-a-real-device)

**Epic:** KIND-3  
**Project:** First Version  
**Apps:** mobile

**Goal:** Timeboxed spike on real iPhone and Android with expo-audio / Expo docs.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome: works / blocked / cut with notes.
- PR or ticket comment cites the Expo audio docs used.

**Do not:**

- Do not start full queue UI until this spike passes.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can play music with queue, shuffle, repeat, next/previous

**Linear:** [KIND-55](https://linear.app/dm-studios/issue/KIND-55/fan-can-play-music-with-queue-shuffle-repeat-nextprevious)

**Epic:** KIND-3  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** spike-bg-audio, artist-track-ui, mobile-shell-glass

**Goal:** Full V1 player bar without craft polish yet (waveform/visualizer later).

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/04-player/01-now-playing.html`
- `docs/design/exports/mobile/04-player/02-queue.html`
- `docs/design/exports/mobile/04-player/03-track-context-menu.html`

**Acceptance:**

- Play from a public track starts audio; mini-player shows title/artist/play-pause.
- Now-playing has shuffle, previous, play/pause, next, repeat off/one/all.
- Queue: view, reorder, remove; play next / add to queue from track menu.
- Locked tracks auto-skip; playback stops at end of queue.
- Entitled exclusives play only when server allows URL.
- Listen events are written for plays (for presence/impact later) without leaking private history to other users.
- Cites Expo audio docs in PR.

**Do not:**

- Do not require Skia waveform or shader visualizer in this ticket.
- Do not add lyrics.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Mini-player shared transition and Skia waveform scrubber on real screens

**Linear:** [KIND-56](https://linear.app/dm-studios/issue/KIND-56/mini-player-shared-transition-and-skia-waveform-scrubber-on-real)

**Epic:** KIND-4  
**Project:** First Version  
**Apps:** mobile  
**Blocked by (slugs until Linear ids exist):** player-queue

**Goal:** Craft techniques 1–2 on the real player.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/04-player/01-now-playing.html`

**Acceptance:**

- Interruptible shared transition from mini-player to now-playing.
- Waveform scrubber draws from track peaks array (not live decode) and seeks audio.
- PR cites Expo / Skia docs used.

**Do not:**

- Do not add visualizer here.
- Do not decode full audio on device for peaks.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can follow artists, see Home feed updates, and react to tracks

**Linear:** [KIND-57](https://linear.app/dm-studios/issue/KIND-57/fan-can-follow-artists-see-home-feed-updates-and-react-to-tracks)

**Epic:** KIND-5  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** discover, artist-track-ui

**Goal:** Home feed of followed artists’ updates; reactions on tracks; locked post shells.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/02-tabs/01-home.html`

**Acceptance:**

- Follow/unfollow works (unfollow blocked if artist is currently routed — show clear message).
- Home shows updates from followed artists; supporters-only posts show lock + Support CTA when not entitled.
- Reaction emoji set works on a playing/visible track and syncs via Convex.
- Voice-note update card can appear when seeded.

**Do not:**

- Do not add comments or DMs.
- Do not add tip jar.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: presence heartbeat and TTL on two devices

**Linear:** [KIND-58](https://linear.app/dm-studios/issue/KIND-58/spike-presence-heartbeat-and-ttl-on-two-devices)

**Epic:** KIND-5  
**Project:** First Version  
**Apps:** mobile, convex

**Goal:** Confirm ~20s heartbeat / ~60s TTL behaviour on two devices.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome works/blocked with measured numbers.

**Do not:**

- Do not ship presence UI until spike passes.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Artist page shows approximate live listener count

**Linear:** [KIND-59](https://linear.app/dm-studios/issue/KIND-59/artist-page-shows-approximate-live-listener-count)

**Epic:** KIND-5  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** spike-presence, player-queue

**Goal:** Presence is a number only, never a name list.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/03-library/04-artist-profile.html`

**Acceptance:**

- While playing an artist’s track, presence count moves appropriately.
- Count is approximate; never lists listener identities.
- Backgrounding decays per spike numbers.

**Do not:**

- Do not show who is listening by name.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: push notification cold start on physical devices

**Linear:** [KIND-60](https://linear.app/dm-studios/issue/KIND-60/spike-push-notification-cold-start-on-physical-devices)

**Epic:** KIND-7  
**Project:** First Version  
**Apps:** mobile

**Goal:** One notification type cold-starts app on real iPhone and Android.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome works/blocked; cites Expo Notifications docs.

**Do not:**

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: universal links open the right screen from cold

**Linear:** [KIND-61](https://linear.app/dm-studios/issue/KIND-61/spike-universal-links-open-the-right-screen-from-cold)

**Epic:** KIND-7  
**Project:** First Version  
**Apps:** mobile, web

**Goal:** One universal link / App Link from Notes/Safari opens the right screen cold.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome; aasa / assetlinks live on Vercel as required.

**Do not:**

- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan gets release push with mute and quiet hours

**Linear:** [KIND-62](https://linear.app/dm-studios/issue/KIND-62/fan-gets-release-push-with-mute-and-quiet-hours)

**Epic:** KIND-7  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** spike-push, follow-feed-react

**Goal:** Push tokens stored; settings for mute + quiet hours; release notification; thank-you card openable from push.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/07-settings/01-notification-settings.html`
- `docs/design/exports/mobile/06-money/04-thank-you-card.html`

**Acceptance:**

- Device token stored in Convex for signed-in user.
- Notification settings: quiet hours + per-artist mute persist and are respected server-side.
- A followed-artist release can enqueue a push (test path documented).
- Thank-you card screen can open from a notification payload.

**Do not:**

- Do not spam pushes in seed without quiet-hours respect.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: RevenueCat webhook and sandbox purchase write Convex entitlement

**Linear:** [KIND-63](https://linear.app/dm-studios/issue/KIND-63/spike-revenuecat-webhook-and-sandbox-purchase-write-convex-entitlement)

**Epic:** KIND-6  
**Project:** First Version  
**Apps:** mobile, convex

**Goal:** Test webhook + sandbox purchase + Convex row + kill app + restore.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome works/blocked; store paperwork called out if blocking.

**Do not:**

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can buy Supporter subscription and restore after reinstall

**Linear:** [KIND-64](https://linear.app/dm-studios/issue/KIND-64/fan-can-buy-supporter-subscription-and-restore-after-reinstall)

**Epic:** KIND-6  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** spike-revenuecat

**Goal:** $4.99 and $9.99 identical entitlements; restore purchases.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/06-money/01-paywall.html`

**Acceptance:**

- Paywall shows both prices with same bullets; Subscribe starts store purchase.
- After success, entitlement row exists server-side; Restore works after reinstall.
- No tip amounts or Family plan.

**Do not:**

- Do not add web checkout.
- Do not invent tip jar.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Supporter can route 1–5 artists and unlock exclusives only for them

**Linear:** [KIND-65](https://linear.app/dm-studios/issue/KIND-65/supporter-can-route-1-5-artists-and-unlock-exclusives-only-for-them)

**Epic:** KIND-6  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** paywall, follow-feed-react

**Goal:** Routing is the exclusive gate; equal split; caps enforced UI+server.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/06-money/02-route-support.html`

**Acceptance:**

- Supporter picks 1–5 followed artists; equal split callout updates; cannot save empty or >5.
- Exclusives playable only for currently routed artists; others stay locked.
- Unfollow of a routed artist is blocked until unrouted.
- Integration test: supporter routed to A cannot fetch B’s exclusive body/URL.

**Do not:**

- Do not custom percentages.
- Do not unlock all exclusives globally.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Supporter can see Impact breakdown and founding badges

**Linear:** [KIND-66](https://linear.app/dm-studios/issue/KIND-66/supporter-can-see-impact-breakdown-and-founding-badges)

**Epic:** KIND-6  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** routing-exclusives

**Goal:** Impact shows this month’s split across routed artists + founding chips. Normal product copy (no demo banners).

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/06-money/03-impact.html`

**Acceptance:**

- Impact shows monthly total and per-routed-artist amounts with equal split.
- Founding badge appears where earned (routing began under 100 supporters).
- No streaming/tips lines; no demo/disclaimer UI copy.

**Do not:**

- Do not show real bank payouts.
- Do not label the screen as a demo portfolio.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Account settings show subscription status, restore, and manage-subscription help

**Linear:** [KIND-67](https://linear.app/dm-studios/issue/KIND-67/account-settings-show-subscription-status-restore-and-manage)

**Epic:** KIND-6  
**Project:** First Version  
**Apps:** mobile  
**Blocked by (slugs until Linear ids exist):** paywall, change-password

**Goal:** Account settings money rows.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/07-settings/02-account-settings.html`

**Acceptance:**

- Shows supporter status and price when entitled.
- Restore purchases action present.
- Manage subscription helper points to App Store / Play.

**Do not:**

- Do not implement store billing UI inside the app beyond instructions.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: offline download, airplane play, and outbox replay

**Linear:** [KIND-68](https://linear.app/dm-studios/issue/KIND-68/spike-offline-download-airplane-play-and-outbox-replay)

**Epic:** KIND-8  
**Project:** First Version  
**Apps:** mobile

**Goal:** Spike outcome works / blocked / cut outbox to Later (requires lock edit if cut).

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome with clear recommendation.

**Do not:**

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Supporter can download entitled tracks and manage downloads

**Linear:** [KIND-69](https://linear.app/dm-studios/issue/KIND-69/supporter-can-download-entitled-tracks-and-manage-downloads)

**Epic:** KIND-8  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** spike-offline, routing-exclusives

**Goal:** Downloads manager + offline play for entitled downloads; degraded banner; outbox if spike kept it.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/03-library/09-downloads.html`
- `docs/design/exports/mobile/08-shared-states/04-home-offline.html`

**Acceptance:**

- Supporter can download an entitled track and see it in Downloads with size/remove.
- Airplane mode can play a downloaded entitled track after entitlement cache rules.
- Offline degraded banner shows what still works.
- If spike kept outbox: queued follow/reaction/listen/route writes replay idempotently.

**Do not:**

- Do not allow free fans to download.
- Do not ship DRM encryption.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: vector embeddings return sensible neighbours

**Linear:** [KIND-70](https://linear.app/dm-studios/issue/KIND-70/spike-vector-embeddings-return-sensible-neighbours)

**Epic:** KIND-9  
**Project:** First Version  
**Apps:** convex

**Goal:** Embed ~20 seed tracks; neighbours look sensible.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome works/blocked.

**Do not:**

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can search exact matches first then semantic results

**Linear:** [KIND-71](https://linear.app/dm-studios/issue/KIND-71/fan-can-search-exact-matches-first-then-semantic-results)

**Epic:** KIND-9  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** seed, mobile-shell-glass

**Goal:** One search field; exact artist/track first; semantic below.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/02-tabs/03-search.html`

**Acceptance:**

- Exact name matches appear first.
- Semantic section appears below when spike passed.
- Locked results show as locked.

**Do not:**

- Do not hide exact matches under semantic.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can generate a natural-language mix and play it

**Linear:** [KIND-72](https://linear.app/dm-studios/issue/KIND-72/fan-can-generate-a-natural-language-mix-and-play-it)

**Epic:** KIND-9  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** spike-vector, player-queue

**Goal:** Make a mix prompt → result with one-line why → playback.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/05-mix/01-make-a-mix.html`
- `docs/design/exports/mobile/05-mix/02-mix-result.html`

**Acceptance:**

- User enters a prompt and gets a mix list with a one-line why.
- Play starts the mix through the player/queue.
- Empty mix only if zero playable tracks (should not happen for seeded accounts).

**Do not:**

- Do not add AutoMix radio endless.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Visualizer toggle and iOS-quality sheet stack on real screens

**Linear:** [KIND-73](https://linear.app/dm-studios/issue/KIND-73/visualizer-toggle-and-ios-quality-sheet-stack-on-real-screens)

**Epic:** KIND-4  
**Project:** First Version  
**Apps:** mobile  
**Blocked by (slugs until Linear ids exist):** craft-miniplayer-waveform

**Goal:** Craft techniques 3–4.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/04-player/01-now-playing.html`

**Acceptance:**

- Visualizer toggle default Off; stays off in Low Power Mode.
- Paywall/queue/context use quality sheet presentation as designed.
- PR cites docs for graphics/sheet approach used.

**Do not:**

- Do not force visualizer on by default.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: browser peak generation for artist upload

**Linear:** [KIND-74](https://linear.app/dm-studios/issue/KIND-74/spike-browser-peak-generation-for-artist-upload)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** web

**Goal:** 6-minute mp3 peaks in Chrome and Safari; scrubber alignment check.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome; fallback Node action noted if Safari fails.

**Do not:**

- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: scheduled publish fires on time

**Linear:** [KIND-75](https://linear.app/dm-studios/issue/KIND-75/spike-scheduled-publish-fires-on-time)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** convex

**Goal:** Scheduler publishes a scheduled track when due.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome works/blocked.

**Do not:**

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: AI upload copilot and thank-you fixtures

**Linear:** [KIND-76](https://linear.app/dm-studios/issue/KIND-76/spike-ai-upload-copilot-and-thank-you-fixtures)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** convex

**Goal:** Fixture/mocked AI path for tags/description/release note and fans-to-thank one-liner.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome works/blocked.

**Do not:**

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Spike: web voice notes on Safari

**Linear:** [KIND-77](https://linear.app/dm-studios/issue/KIND-77/spike-web-voice-notes-on-safari)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** web

**Goal:** Record voice note in Safari; fallback photo+text if fail.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- Written outcome; lock update if cut voice.

**Do not:**

- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Artist can use Studio home and edit profile on web

**Linear:** [KIND-78](https://linear.app/dm-studios/issue/KIND-78/artist-can-use-studio-home-and-edit-profile-on-web)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** web, convex  
**Blocked by (slugs until Linear ids exist):** studio-auth, seed

**Goal:** Studio home + profile editor. Responsive.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/01-studio/02-home.html`
- `docs/design/exports/web/01-studio/03-profile.html`

**Acceptance:**

- Signed-in artist sees home: recent releases, scheduled, supporter count, recent thank-yous (seeded ok).
- Can edit name, bio, avatar, cover.
- Usable at ~375px and 1280px+.

**Do not:**

- Do not allow fans into Studio.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Artist can upload and schedule releases with peaks and visibility

**Linear:** [KIND-79](https://linear.app/dm-studios/issue/KIND-79/artist-can-upload-and-schedule-releases-with-peaks-and-visibility)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** web, convex  
**Blocked by (slugs until Linear ids exist):** spike-peaks-web, studio-home-profile

**Goal:** Upload audio+artwork, peaks, publish/schedule, list with states. Responsive.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/01-studio/04-upload-release.html`
- `docs/design/exports/web/01-studio/05-releases.html`

**Acceptance:**

- Artist uploads audio + artwork; peaks generate per spike outcome.
- Visibility public or supporters-only; publish now or schedule.
- Releases list shows scheduled/published/hidden with edit/hide.
- Copilot suggestions editable if spike passed (else manual fields only).
- Responsive 375px and 1280px+.

**Do not:**

- Do not generate songs with AI.
- Do not AI cover art.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Artist can post updates (text/photo/voice) and list them

**Linear:** [KIND-81](https://linear.app/dm-studios/issue/KIND-81/artist-can-post-updates-textphotovoice-and-list-them)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** web, convex  
**Blocked by (slugs until Linear ids exist):** studio-home-profile

**Goal:** Update composer + list. Responsive. Voice only if spike passed.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/01-studio/06-update-composer.html`
- `docs/design/exports/web/01-studio/07-updates.html`

**Acceptance:**

- Artist can post Everyone or Supporters-only update with text and optional photo.
- Voice note attach works only if spike-voice passed; else photo/text only.
- Updates list shows audience chip and date.
- Responsive.

**Do not:**

- Do not add comments.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Artist can see supporters, thank fans, and view earnings

**Linear:** [KIND-80](https://linear.app/dm-studios/issue/KIND-80/artist-can-see-supporters-thank-fans-and-view-earnings)

**Epic:** KIND-10  
**Project:** First Version  
**Apps:** web, convex  
**Blocked by (slugs until Linear ids exist):** studio-home-profile, routing-exclusives

**Goal:** Supporters list, fans-to-thank, earnings from routed subscriptions only. Responsive. No demo banners.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/01-studio/08-supporters.html`
- `docs/design/exports/web/01-studio/09-fans-to-thank.html`
- `docs/design/exports/web/01-studio/10-earnings.html`

**Acceptance:**

- Supporters table: name, routing since, founding yes/no — own artist only.
- Fans to thank: ranked shortlist, editable one-liner, send.
- Earnings: month total, from supporters + store fees 30%, how-calculated 70/30 equal split, month breakdown. No streaming/tips/demo copy.
- Monthly earnings rows are produced by the server cron (or seed for past months) — not invented in the client.
- Artist cannot read another artist’s supporters/earnings (test).
- Responsive.

**Do not:**

- Do not invent streaming payouts or tips.
- Do not put demo disclaimer banners in UI.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Fan can request to become an artist from mobile account settings

**Linear:** [KIND-82](https://linear.app/dm-studios/issue/KIND-82/fan-can-request-to-become-an-artist-from-mobile-account-settings)

**Epic:** KIND-11  
**Project:** First Version  
**Apps:** mobile, convex  
**Blocked by (slugs until Linear ids exist):** account-money

**Goal:** Request form + status chip none/pending/approved/declined.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/07-settings/04-request-to-become-an-artist.html`
- `docs/design/exports/mobile/07-settings/02-account-settings.html`

**Acceptance:**

- Signed-in fan submits display name/bio/why; one pending at a time.
- Status visible on account settings / request screen.
- After decline, re-request allowed; after approve, not.

**Do not:**

- Do not put this form on web fan settings (web has no fan account).
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Admin can approve or decline artist requests and verify artists

**Linear:** [KIND-83](https://linear.app/dm-studios/issue/KIND-83/admin-can-approve-or-decline-artist-requests-and-verify-artists)

**Epic:** KIND-11  
**Project:** First Version  
**Apps:** web, convex  
**Blocked by (slugs until Linear ids exist):** artist-request, studio-auth

**Goal:** Admin requests queue + artists list. Responsive.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/03-admin/01-requests.html`
- `docs/design/exports/web/03-admin/02-artists.html`

**Acceptance:**

- Admin sees pending requests; approve creates/links Artist; decline sets declined.
- Admin can verify/unverify artists.
- Non-admin cannot call these mutations (test).
- Approved person can sign into Studio on web.
- Responsive.

**Do not:**

- Do not build a become-admin public flow.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Admin can hide or remove catalog items and set featured slots

**Linear:** [KIND-84](https://linear.app/dm-studios/issue/KIND-84/admin-can-hide-or-remove-catalog-items-and-set-featured-slots)

**Epic:** KIND-11  
**Project:** First Version  
**Apps:** web, convex  
**Blocked by (slugs until Linear ids exist):** admin-requests-artists, discover

**Goal:** Catalog moderation + featured discovery. Responsive.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/03-admin/03-catalog.html`
- `docs/design/exports/web/03-admin/04-featured.html`

**Acceptance:**

- Admin can hide/remove catalog items so they stop appearing in fan surfaces.
- Admin can place/order featured discovery slots.
- Responsive.

**Do not:**

- Do not add full CMS beyond these tools.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Public artist/track/post/mix pages play public audio and lock exclusives

**Linear:** [KIND-85](https://linear.app/dm-studios/issue/KIND-85/public-artisttrackpostmix-pages-play-public-audio-and-lock-exclusives)

**Epic:** KIND-12  
**Project:** First Version  
**Apps:** web, convex  
**Blocked by (slugs until Linear ids exist):** seed

**Goal:** Share URLs; simple public player; Get the app for locks. Responsive. No fan account.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/02-public/02-artist-page.html`
- `docs/design/exports/web/02-public/03-track-page.html`
- `docs/design/exports/web/02-public/04-post-page.html`
- `docs/design/exports/web/02-public/05-mix-page.html`

**Acceptance:**

- Public pages render without sign-in.
- Public audio: play/pause/seek/next/previous in simple bottom player.
- Exclusive content: locked shell + Get the app — no exclusive streaming on web.
- No fan Follow that writes follows on web — CTA is Get the app.
- Responsive 375px and 1280px+.

**Do not:**

- Do not add fan sign-in on public pages.
- Do not craft waveform/visualizer on web.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Public browse home and install prompt with deep-link handoff

**Linear:** [KIND-86](https://linear.app/dm-studios/issue/KIND-86/public-browse-home-and-install-prompt-with-deep-link-handoff)

**Epic:** KIND-12  
**Project:** First Version  
**Apps:** web  
**Blocked by (slugs until Linear ids exist):** public-pages, spike-deeplink

**Goal:** Signed-out browse + install. Responsive.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/web/02-public/01-browse-home.html`
- `docs/design/exports/web/02-public/06-install-prompt.html`

**Acceptance:**

- Browse home shows Featured/Rising; primary CTA Get the app.
- Install prompt offers open app / store badges.
- Deep link handoff works when app installed (after deeplink spike).
- Responsive.

**Do not:**

- Do not require fan account for browse.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### Shipped screens show loading, empty, and error states

**Linear:** [KIND-88](https://linear.app/dm-studios/issue/KIND-88/shipped-screens-show-loading-empty-and-error-states)

**Epic:** KIND-2  
**Project:** First Version  
**Apps:** mobile, web  
**Blocked by (slugs until Linear ids exist):** follow-feed-react, library-playlists

**Goal:** Skeletons match layout; empty has next action; error has retry. Wire on already-shipped screens.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Design:**

- `docs/design/exports/mobile/08-shared-states/01-home-loading-skeleton.html`
- `docs/design/exports/mobile/08-shared-states/02-playlists-empty.html`
- `docs/design/exports/mobile/08-shared-states/03-home-error-feed.html`

**Acceptance:**

- Home (or equivalent) loading uses skeleton not blank spinner-only page.
- Empty playlists shows a real next action.
- Feed error shows retry.
- Seeded accounts do not show empty home feed.

**Do not:**

- Do not leave fake placeholders for data we already store.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

### TestFlight, Play closed testing, ACCESS-LIST, and 90-second demo script

**Linear:** [KIND-87](https://linear.app/dm-studios/issue/KIND-87/testflight-play-closed-testing-access-list-and-90-second-demo-script)

**Epic:** KIND-13  
**Project:** Launch  
**Apps:** mobile, web

**Goal:** Store packaging and demo packaging.

**Docs:**

- PRD: `docs/product/product-requirements.md`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`

**Acceptance:**

- TestFlight and Play closed testing builds exist or blocked with clear next action.
- ACCESS-LIST has demo logins (gitignored).
- 90-second demo script documented.
- Case study claims match what shipped.

**Do not:**

- Do not invent unshipped features in the case study.
- Do not ship a desktop-only layout; must work at ~375px and 1280px+.
- Do not skip checking official Expo/library docs before coding; cite sources in the PR.

**Where code lives:** follow repo app/convex/shared layout for this slice.

---

## Gap check (verified twice against PRD §9 + phases + spikes)

### PRD mobile screens

- Sign up/in/out → mobile-auth
- Onboarding genres+follow → onboarding
- Home feed → follow-feed-react
- Discover → discover
- Search → search
- Artist profile → artist-track-ui + presence
- Track/post detail locked/unlocked → artist-track-ui + follow-feed-react
- Now-playing + queue + menus → player-queue + craft tickets
- Mini-player → mobile-shell-glass + player-queue + craft
- Mix → mix
- Library + playlists + liked → library-playlists
- Downloads → offline-downloads
- Paywall → paywall
- Route support → routing-exclusives
- Impact → impact
- Thank-you card → push-settings
- Notification settings → push-settings
- Account settings → account-money + change-password + artist-request
- Change password → change-password
- Request to become artist → artist-request
- Shared loading/empty/error/offline → shared-states + offline-downloads

### PRD web Studio

- Sign in → studio-auth
- Home → studio-home-profile
- Profile → studio-home-profile
- Upload+releases → studio-upload-releases
- Updates → studio-updates
- Supporters/thanks/earnings → studio-supporters-thanks-earnings

### PRD public + admin

- Public pages + player → public-pages
- Browse + install → public-browse-install
- Admin requests/artists → admin-requests-artists
- Admin catalog/featured → admin-catalog-featured

### Spikes (system design §12)

- spike-password-reset included
- spike-bg-audio included
- spike-presence included
- spike-push included
- spike-deeplink included
- spike-revenuecat included
- spike-offline included
- spike-vector included
- spike-peaks-web included
- spike-schedule included
- spike-ai-fixtures included
- spike-voice included

### Standing rules baked into tickets

- No fan web account / no exclusive web streaming / responsive web / Expo docs citation / no demo UI copy on earnings/impact / wire existing data / never-branch-off-linear (`feature/KIND-n` only)

### Open questions (ask Delasi — do not assume)

1. Password-reset spike: keep as Todo now (gates Forgot UI only). Confirm transactional email provider account is ready before that spike starts.
2. Apple Paid Apps Agreement + Play merchant: start in Phase 0 paperwork outside tickets — confirm when store agreements are signed before `spike-revenuecat`.
3. If offline spike recommends cutting outbox: that requires an explicit lock edit from you before the offline ticket changes scope.
