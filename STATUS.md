# Project status (read this first)

**For agents and humans:** handoff checklist for this job. Update when a phase finishes or “next” changes.

**Do not put secrets here.** Use `ACCESS-LIST.md` (gitignored) for credentials.

---

## Snapshot

- **Client / job:** Kindred (own-product portfolio flagship). Outcome B (studio accounts).
- **Backend:** Convex
- **Current phase:** Workshop — blank-slate scaffold (no auth UI). Vercel redeploy after push. Next: Expo.
- **Last updated:** 2026-09-19
- **Blocked / open:** None.

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
- [ ] Expo / EAS (mobile)
- [ ] Slack workshop channel `#kindred` + bots
- [ ] Backend cloud (Convex) — thin project + env on local / Vercel / EAS
- [x] Access list (`ACCESS-LIST.md`) — GitHub recorded; fill Vercel URL if missing
- [ ] Preview cooks working (web + phone as needed)

---

## Product path

- [x] System design (approved in studio practice pack; copy into `docs/product/` after Convex cloud)
- [ ] Screen design
- [ ] Linear build tickets (epics exist; full slices after screens)
- [ ] Build / demos / TestFlight / Play
- [ ] Launch

---

## Next action (one line)

Confirm Vercel production deploy of the corrected scaffold is green. Then workshop Expo tick.

---

## Pointers

- Practice pack (studio): `project-template/docs/client-delivery/practice/kindred/`
- Linear team: Kindred (`KIND`)
- Product requirements: `docs/product/product-requirements.md`
