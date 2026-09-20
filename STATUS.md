# Project status (read this first)

**For agents and humans:** handoff checklist for this job. Update when a phase finishes or “next” changes.

**Do not put secrets here.** Use `ACCESS-LIST.md` (gitignored) for credentials.

---

## Snapshot

- **Client / job:** Kindred (own-product portfolio flagship). Outcome B (studio accounts).
- **Backend:** Convex
- **Current phase:** Screen design — keepers, design system, and UX Pilot prompts filled. Awaiting credit confirm to generate.
- **Last updated:** 2026-09-20
- **Blocked / open:** Vercel Slack slash commands broken for this workspace/app; use Vercel dashboard. Not blocking product work.

---

## Before invoice 1

- [x] Discovery / lock (own product — practice pack)
- [x] Questionnaire
- [x] Product requirements locked — `docs/product/product-requirements.md`
- [x] Workshop treated as open (no invoice for own product)

---

## Workshop (tools, not product features)

- [x] Scaffold monorepo (corrected: template + thin Convex Auth; no Ridgeway UI)
- [x] Private GitHub repo (`delasimensah/kindred`)
- [x] Linear team + GitHub connection
- [x] Vercel (web) — project exists; production redeploy after scaffold fix
- [x] Expo / EAS (mobile) — `@dm-studios/kindred`, projectId in `app.config.ts`
- [x] Slack workshop channel `#kindred` + bots — GitHub + Linear; **Vercel Slack bot skipped** (slash commands dead; see ACCESS-LIST)
- [x] Backend cloud (Convex) — `kindred` on team `dm-studios`; thin schema pushed; URL on local / Vercel / EAS
- [x] Access list (`ACCESS-LIST.md`) — GitHub, Expo, Slack, Vercel, Convex
- [ ] Preview cooks working (web + phone as needed) — web redeployed with Convex URL; phone when you open Expo

---

## Product path

- [x] System design — confirmed 20 Sep 2026 vs live `kindred` Convex; copies in `docs/product/system-design.md` + `convex-design.md`
- [ ] Screen design — keepers + design system + prompts ready; UX Pilot generation not started
- [ ] Linear build tickets (epics exist; full slices after screens)
- [ ] Build / demos / TestFlight / Play
- [ ] Launch

---

## Next action (one line)

Review prompts in `docs/design/kindred-ux-pilot-flow-prompts.md`. When ready, confirm UX Pilot credit spend to generate. No build tickets yet.

---

## Pointers

- Practice pack (studio): `project-template/docs/client-delivery/practice/kindred/`
- Linear team: Kindred (`KIND`)
- Product requirements: `docs/product/product-requirements.md`
- Screen keepers (locked): `docs/design/reference-map.md`
- Design system (locked): `docs/design/design-system.md` — soft gold `#FFD369` on charcoal
- Palette preview kept: `docs/design/palette-previews/kindred-palette-locked.png`
- System design: `docs/product/system-design.md`
- Convex design: `docs/product/convex-design.md`
- Convex dashboard: https://dashboard.convex.dev/t/dm-studios/kindred
