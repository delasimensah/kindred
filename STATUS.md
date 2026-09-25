# Project status (read this first)

**For agents and humans:** handoff checklist for this job. Update when a phase finishes or “next” changes.

**Do not put secrets here.** Use `ACCESS-LIST.md` (gitignored) for credentials.

---

## Snapshot

- **Client / job:** Kindred (own-product portfolio flagship). Outcome B (studio accounts).
- **Backend:** Convex
- **Current phase:** Build — **KIND-45** Artist Studio / admin web sign-in **Done**. Phone listening core through KIND-59 **Done**. **Next:** KIND-78 (Studio home and profile on web).
- **Last updated:** 2026-09-25
- **Blocked / open:** Vercel Slack slash commands broken for this workspace/app; use Vercel dashboard. Not blocking product work.
  - **Convex free-plan file egress (team `dm-studios`, Sep 2026).** Keep listens short (shrunk clips). Guide: `docs/convex-usage.md`. Do not upgrade solely for this.
  - **Phone alerts (KIND-62):** needs Google + Apple keys on Expo before delivery can be tested on preview. Guide: studio `project-template/docs/client-delivery/push-notifications-setup.md`.
  - Password email (KIND-46): **Backlog** until email sending is set up.
  - Store purchase paperwork (Apple/Google): when we reach KIND-64.
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

**KIND-78** — artist can use Studio home and edit profile on web.

---

## Remaining First Version (how to test)

- **Web (browser):** KIND-78 Studio home/profile → upload/releases → updates → supporters → admin → public pages.
- **Phone preview:** money (KIND-64+), alerts (KIND-62), offline (KIND-69), search/mix, polish — prove hard bits **inside** those tickets on preview, not on separate short-check tickets.
- **Backlog until email:** KIND-46.
- **Canceled short-check tickets (25 Sep 2026):** KIND-60, 61, 63, 68, 70, 74, 75, 76, 77 — acceptance folded into the feature tickets above.

Phone vs simulator: `.cursor/rules/phone-tasks-must-be-testable.mdc`.  
Phone-alert setup clicks: studio `project-template/docs/client-delivery/push-notifications-setup.md`.

---

## Pointers

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
