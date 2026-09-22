# Navigation Guide

Expo Router uses file-based routing. Signed-out fans land on Welcome. Signed-in fans who have not finished onboarding land on genres or follows. Signed-in fans who finished onboarding land in the session until Home tabs ship.

## Route tree

```
app/
├── index.tsx                     → redirect by session
├── (auth)/index.tsx              → welcome (no fields)
├── (auth)/sign-in.tsx            → email, then password
├── (auth)/sign-up.tsx            → name, then email, then password
├── (onboarding)/index.tsx        → resume dispatcher
├── (onboarding)/genres.tsx       → pick genres
├── (onboarding)/follow-artists.tsx → follow at least two artists
└── (main-app)/index.tsx          → signed-in session with Sign out
```

## Protected routes

`app/_layout.tsx` uses Expo Router `Stack.Protected`. Do not add a second redirect layer after sign-in; the guard chooses the group.

- Cold start waits for fonts and Convex auth restore under the native splash, then shows the stack. If a session already exists, the splash also waits until the fan profile is ready.
- Signed-in with a profile and unfinished onboarding → `(onboarding)`
- Signed-in with onboarding complete → `(main-app)`
- Signed out → `(auth)` welcome
- Do not mount `(main-app)` while the profile is still loading, or before onboarding is complete.
- Root stack animation is off so auth does not slide onto the session.

Sign-in does not call `router.push` after success. After `signIn` succeeds, the guard shows onboarding or the session. `app/index.tsx` is the fallback for `/`. It sends signed-out people to welcome, unfinished fans to onboarding, and finished fans to the session.

Onboarding `index` sends people with no genres to `genres`, and people who already picked genres to `follow-artists`. Back from follows pops to genres so they can edit. The two progress bars overlay the onboarding screens so they stay put on the same background while the genre tiles and artist list slide.

## Path rules

Same route group: short path.

```tsx
router.replace("/sign-in");
```

Different groups: include the groups.

```tsx
router.push("/(auth)/sign-up");
router.replace("/(auth)/sign-in");
router.replace("/(onboarding)/genres");
router.replace("/(main-app)");
```

## Methods

- `router.push()` — open a screen (sign-up from welcome, follows from genres).
- `router.replace()` — switch sign-in and sign-up so back returns to welcome.
- `router.back()` — return from a step screen to welcome, or from follows to genres.

TypeScript autocomplete on `router.push("` lists valid routes (`experiments.typedRoutes` is on).
