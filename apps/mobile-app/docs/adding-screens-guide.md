# Adding Screens Guide

How to add a screen to the Kindred mobile app.

## Architecture

Expo Router files under `app/` are thin `*Route` components. They call Convex `useQuery` / `useMutation` and render a `*Screen` from `components/screens/`.

```
Root Stack (app/_layout.tsx)
├── index                  Redirect by session
├── (auth)                 Welcome, then sign in / sign up
└── (main-app)             Signed-in session
    └── index              Session home until tabs ship
```

## 1. Add a stack screen

1. Put the UI in `components/screens/[stack]/NameScreen/NameScreen.tsx` with a test.
2. Export it from `components/index.ts` if a route file imports it.
3. Add `app/(group)/name.tsx` as a `*Route` that loads data and renders the screen.
4. Register it in that group's `_layout.tsx`.

```tsx
<Stack.Screen name="name" />
```

Navigate with the full path when leaving a group:

```tsx
router.push("/(auth)/sign-up");
```

## 2. Add a modal

Same as a stack screen, with modal presentation:

```tsx
<Stack.Screen name="name" options={{ presentation: "modal" }} />
```

Close with `router.back()`.

## 3. Add an auth screen

1. Screen under `components/screens/auth/`.
2. Route under `app/(auth)/`.
3. Register in `app/(auth)/_layout.tsx`.

Welcome is `app/(auth)/index.tsx`. Sign-in is `app/(auth)/sign-in.tsx`. Sign-up is `app/(auth)/sign-up.tsx`. Sign-up is name, then email, then password. There is no forgot-password screen until the password-reset short check passes.

## Route file shape

```tsx
import { SignInScreen } from "@/components";

const SignInRoute = () => {
  return <SignInScreen />;
};

export default SignInRoute;
```

Keep route files under a few dozen lines. Layout, copy, and lists live in the screen component. Permission checks stay in Convex.

## Related

- [Navigation Guide](./navigation-guide.md)
- [Project Structure](./project-structure.md)
