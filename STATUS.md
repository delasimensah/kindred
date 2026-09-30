# Project status (read this first)

**For agents and humans:** handoff checklist for this job. Update when a phase finishes or “next” changes.

**Do not put secrets here.** Use `ACCESS-LIST.md` (gitignored) for credentials.

---

## Snapshot

- **Client / job:** Kindred (own-product portfolio flagship). Outcome B (studio accounts).
- **Backend:** Convex
- **Current phase:** Build — **KIND-73** is **Done**. The player visualizer starts off, and a fan can turn it on. Reactions save, and tapping the same emoji clears one. Track options and the queue open as sheets. The AI mix (KIND-72) is next, after we pick a real mix or the genre and tag fallback. KIND-67 account settings is done. KIND-66 impact is done. KIND-65 routing is done. KIND-64 purchase and restore is done. KIND-71 exact name search is done. Meaning-based search is not in this version (29 Sep 2026).
- **Last updated:** 2026-09-30
- **Blocked / open:** Vercel Slack slash commands broken for this workspace/app; use Vercel dashboard. Not blocking product work.
  - **Convex free-plan file egress (team `dm-studios`, Sep 2026).** This Kindred deployment has sent about 1.3 GB of data this month. The free cap is 1 GB for the whole team. Keep listens short (shrunk clips). Guide: `docs/convex-usage.md`. Do not upgrade solely for this.
  - **Phone alerts (KIND-62):** needs Google + Apple keys on Expo before delivery can be tested on preview. Guide: studio `project-template/docs/client-delivery/push-notifications-setup.md`.
  - Password email (KIND-46): **Backlog** until email sending is set up.
  - Visualizer Low Power Mode needs a new Kindred(Dev) build before it can force the waves off. This build does not include the battery module, so the switch still works and the waves can turn on.
  - Store purchase tests: the **preview app** shows the paywall screen on a real phone. The practice purchase (buy, restore, expiry) is on the **development app** with RevenueCat’s Test Store. How long each practice plan lasts: `docs/test-purchases.md`. Kindred’s prices are one month, so on the dev app the plan renews every 5 minutes and ends about 25 minutes after the purchase. Kindred is a demo, not a store app, unless it later earns a real release (29 Sep 2026). Leave the Apple Paid Apps Agreement and the EU trader form untouched.
  - Offline retry queue: explain at KIND-69; if we cut it, edit the lock with Delasi first.

---

## Before invoice 1

- [x] Discovery / lock (own product — practice pack)
- [x] Questionnaire
- [x] Product requirements locked — `docs/product/product-requirements.md` (amended 20 Sep 2026: no fan account on web)
- [x] Workshop treated as open (no invoice for own product)

---

## Workshop (tools, not product features)

- [x] Scaffold monorepo (corrected: template + thin Convex Auth; no Ridgeway UI)
- [x] Private GitHub repo (`delasimensah/kindred`)
- [x] Linear team + GitHub connection
- [x] Vercel (web) — project exists; production redeploy after scaffold fix
- [x] Expo / EAS (mobile) — `@dm-studios/kindred`, projectId in `app.config.ts`
- [x] App icon + splash — SnapAI option `02`; background `#222831`; splash image is transparent logo (Expo paints the hex). Files under `apps/mobile-app/assets/icons/` (including `kindred.icon`). Notes: `docs/design/icon-candidates/`
- [x] V1 native libs (SDK 57) — glass/blur, audio, Skia, notifications, RevenueCat, symbols, `@expo/ui`; plugins in `app.config.ts`
- [x] Slack workshop channel `#kindred` + bots — GitHub + Linear; **Vercel Slack bot skipped** (slash commands dead; see ACCESS-LIST)
- [x] Backend cloud (Convex) — `kindred` on team `dm-studios`; thin schema pushed; URL on local / Vercel / EAS
- [x] Access list (`ACCESS-LIST.md`) — GitHub, Expo, Slack, Vercel, Convex
- [x] Preview cooks working (web + phone as needed) — web redeployed with Convex URL; phone preview cooking / install when ready

---

## Product path

- [x] System design — confirmed 20 Sep 2026 vs live `kindred` Convex; copies in `docs/product/system-design.md` + `convex-design.md`
- [x] Screen design exports — 54 UX Pilot HTML screens in `docs/design/exports/` (mobile + web); keepers + design system locked; no fan web account
  - Index: `docs/design/exports/README.md`
  - Mobile: https://uxpilot.ai/a/ui-design?page=d8OlN72DRdgN9bfneeWJ
  - Web: https://uxpilot.ai/a/ui-design?page=xQqMNOic1uI1n729QFUr
  - Archived (out of V1): fan Sign In, fan Account Settings
- [x] Screen design lock — locked enough to build from (21 Sep 2026); refine only if a ticket is blocked by a broken screen
- [x] Linear build tickets — KIND-42–KIND-88 created as Todo under epics KIND-1–KIND-13 (canceled KIND-14–KIND-41 left untouched); map in `docs/product/_linear-id-map.json`
- [x] KIND-42 shared design tokens — colors, radii, typography in `packages/shared`; web + mobile consume them; font paths in `docs/design/fonts.md`
- [ ] Build / demos / TestFlight / Play
- [ ] Launch

---

## Next action (one line)

**KIND-72** — AI mix. It waits until we pick a real mix (an OpenAI key on Convex, a few cents a try) or the genre and tag fallback (no key, one fixed reason line). Password reset (KIND-46) stays on the backlog until email sending is set up. Downloads (KIND-69) and notifications (KIND-62) stay later. TestFlight (KIND-87) only if we still want it.

---

## Remaining First Version (how to test)

- **Phone:** KIND-82 fan artist request **Done**.
- **Web (browser):** KIND-86 public browse home and install prompt is **Done**. KIND-85 public pages are **Done**.
- **Build order from here:** KIND-72 AI mix (pick real OpenAI or the genre and tag fallback first), then KIND-62 notifications, KIND-69 downloads, and KIND-87 TestFlight only if we still want it. KIND-46 password reset stays on the backlog until email sending is set up. KIND-73 player visualizer is done. KIND-67 account subscription settings is done. KIND-66 impact is done. KIND-65 routing is done. KIND-64 purchase and restore is done. KIND-71 exact name search is done. Meaning-based search is not in this version (29 Sep 2026).
- **Phone preview:** prove alerts, purchases, and downloads on a real phone inside those tickets.
- **Canceled short-check tickets (25 Sep 2026):** KIND-60, 61, 63, 68, 70, 74, 75, 76, 77 — acceptance folded into the feature tickets above.

Phone vs simulator: `.cursor/rules/phone-tasks-must-be-testable.mdc`.  
Phone-alert setup clicks: studio `project-template/docs/client-delivery/push-notifications-setup.md`.

---

## Pointers

- Pull request (KIND-73): https://github.com/delasimensah/kindred/pull/33
- Pull request (KIND-67): https://github.com/delasimensah/kindred/pull/32
- Pull request (KIND-66): https://github.com/delasimensah/kindred/pull/31
- Pull request (KIND-65): https://github.com/delasimensah/kindred/pull/30
- Pull request (KIND-64): https://github.com/delasimensah/kindred/pull/29
- Pull request (KIND-71): https://github.com/delasimensah/kindred/pull/28
- Pull request (KIND-86): https://github.com/delasimensah/kindred/pull/27
- Pull request (KIND-85): https://github.com/delasimensah/kindred/pull/26
- Pull request (KIND-84): https://github.com/delasimensah/kindred/pull/25
- Pull request (KIND-83): https://github.com/delasimensah/kindred/pull/24
- Pull request (KIND-82): https://github.com/delasimensah/kindred/pull/23
- Pull request (KIND-80): https://github.com/delasimensah/kindred/pull/22
- Pull request (KIND-81): https://github.com/delasimensah/kindred/pull/21
- Pull request (KIND-91): https://github.com/delasimensah/kindred/pull/20
- Pull request (KIND-79): https://github.com/delasimensah/kindred/pull/19
- Pull request (KIND-78): https://github.com/delasimensah/kindred/pull/18
- Pull request (KIND-45): https://github.com/delasimensah/kindred/pull/17
- Pull request (KIND-59): https://github.com/delasimensah/kindred/pull/16
- Pull request (KIND-58): https://github.com/delasimensah/kindred/pull/15
- Pull request (KIND-89): https://github.com/delasimensah/kindred/pull/14
- Pull request (KIND-57): https://github.com/delasimensah/kindred/pull/13
- Pull request (KIND-56): https://github.com/delasimensah/kindred/pull/12
- Pull request (KIND-55): https://github.com/delasimensah/kindred/pull/11
- Pull request (KIND-54): https://github.com/delasimensah/kindred/pull/10
- Pull request (KIND-52): https://github.com/delasimensah/kindred/pull/9
- Pull request (KIND-51): https://github.com/delasimensah/kindred/pull/8
- Pull request (KIND-53): https://github.com/delasimensah/kindred/pull/7
- Product: `docs/product/`
- Design exports: `docs/design/exports/`
- Access: `ACCESS-LIST.md` (gitignored)
