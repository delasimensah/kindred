# Kindred

Patronage app for rising African artists. Fans support artists with a monthly subscription routed to the artists they choose. Artists release music from a web studio.

## Stack

- **Mobile:** Expo (React Native) — primary fan and supporter surface
- **Web:** Next.js — Artist Studio, public pages (simple public player), thin admin
- **Backend:** Convex with Convex Auth (email and password)
- **Shared:** `packages/shared` for types, validation, and utilities

## Setup

1. From this folder: `yarn install`
2. Start Convex (after workshop cloud link): `yarn dev:backend`
3. Web: `yarn dev:web`
4. Mobile: `yarn dev:mobile`

Product requirements: [docs/product/product-requirements.md](./docs/product/product-requirements.md).

Read [STATUS.md](./STATUS.md) for phase and next action.
