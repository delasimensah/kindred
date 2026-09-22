# Agent instructions for Kindred

This is a **Turborepo** with a **Next.js** web app, an **Expo** mobile app, a **shared** package, and a **Convex** backend. Convex Auth (email and password) is the sign-in path.

## Where we left off

Read **`STATUS.md`** at the repo root before planning or implementing. Update it when you finish a phase or change the next action. On a feature branch, write it as the state after that pull request merges. Do not put secrets in `STATUS.md`.

## Compliance (do this before coding)

- **`.cursor/rules/wait-for-approval-before-git.mdc`** — Do the work, then stop. Do not commit, push, or open a pull request until you are asked.
- **`.cursor/rules/explain-the-work.mdc`** — After a task they asked you to do, explain what changed in everyday words, then the files and why, then the test commands.
- **`.cursor/rules/mandatory-project-docs.mdc`** — For your task type, **read the listed `docs/...` files** with the Read tool before implementing.
- **Lint (barrel imports):** Top-level barrels — `@/constants`, `@/hooks`, `@/utils`, `@/assets`, `@/services`, `shared`. Inside `components/`, relative imports for components.

## Code organization and style

- **Web app:** `apps/web-app/docs/project-structure.md` and `apps/web-app/docs/developer-decision-guide.md`.
- **Mobile app:** `apps/mobile-app/docs/project-structure.md`, `apps/mobile-app/docs/developer-decision-guide.md`, and `apps/mobile-app/docs/adding-screens-guide.md`.
- **Shared package:** `packages/shared/docs/contributing-guide.md`.
- **Imports / exports / components:** `docs/import-patterns-guide.md`, `docs/export-patterns-guide.md`, `docs/component-organization-guide.md`.

## Product and architecture

- **`docs/product/product-requirements.md`** — What we are building. Do not invent features that are not in this file.
- **`docs/product/system-design.md`** and **`docs/product/convex-design.md`** — Only after those files exist. Until then, do not invent tables or permission rules beyond the product requirements and the thin Convex auth/profile stub.

## Stack and official docs

Prefer these official sources. Add them as **@Docs** in Cursor (Settings → Indexing & Docs).

- Turborepo, TypeScript, Yarn workspaces
- Next.js, React, Mantine, Tailwind
- Expo, Expo Router, React Native, NativeWind
- Convex, Convex Auth, Zod

## Hard rules for this product

- Web stays a blank slate until Artist Studio / admin tickets. Mobile fan sign-in and sign-up are product screens (KIND-43). There is no web fan auth.
- Product data uses Convex `useQuery` / `useMutation`. Permission checks belong at the top of every public Convex function. The client is not trusted.
- Convex Auth needs `JWT_PRIVATE_KEY`, `JWKS`, and `SITE_URL` on the Convex deployment. Read `docs/convex-auth-env.md`. A sign-in ticket is not done until those three names exist on that Convex. Tests do not prove they exist. Do not commit the keys.
- Entitlement is written only from the server-side RevenueCat source of truth. The client never decides Supporter status.
- Exclusives unlock only for artists the supporter is routed to.
- Purchases are mobile-only. No web checkout.
- Artist upload and scheduling are web-only in V1.
- Zustand is only for client extras, not product catalog data.
- The website is always responsive. Read `docs/responsive-design-guide.md`.
- Linear branches: `feature/KIND-n` for an existing issue only. Board: Todo → In Progress → Done. Backlog is later work.

## How to get the best results

1. Read `STATUS.md`, then the product requirements for the slice.
2. One Linear issue at a time. Design export linked before In Progress.
3. Run `yarn lint`, `yarn type-check`, and `yarn test:ci` before you say the work is done.
