# Project status (read this first)

**For agents and humans:** handoff checklist for this job. Update when a phase finishes or “next” changes.

**Do not put secrets here.** Use `ACCESS-LIST.md` (gitignored) for credentials.

---

## Snapshot

- **Client / job:** Kindred (own-product portfolio flagship). Outcome B (studio accounts).
- **Backend:** Convex
- **Current phase:** Workshop — Convex cloud done. Next: confirm system design on the live project, then screen design.
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

- [x] System design (approved in studio practice pack; copy into `docs/product/` after Convex cloud)
- [ ] Screen design
- [ ] Linear build tickets (epics exist; full slices after screens)
- [ ] Build / demos / TestFlight / Play
- [ ] Launch

---

## Next action (one line)

Confirm system design still matches the live Convex project, then screen design (`07`). No feature UI tickets yet.

---

## Pointers

- Practice pack (studio): `project-template/docs/client-delivery/practice/kindred/`
- Linear team: Kindred (`KIND`)
- Product requirements: `docs/product/product-requirements.md`
