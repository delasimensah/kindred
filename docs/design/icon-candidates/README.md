# Icon candidates (Kindred)

Made 21 Sep 2026 with SnapAI. Logo is soft gold `#FFD369`. Background we shipped is `#222831` (SnapAI drew a darker one; we corrected it).

Options:

- `01.png` — people + instrument neck
- `02.png` — people + music note (**this one shipped**)
- `03.png` — instrument + sound waves

Files in the app:

- `apps/mobile-app/assets/icons/icon.png` — logo on the solid background
- `apps/mobile-app/assets/icons/icon-foreground.png` — logo only (clear around it); splash + iOS layer
- `apps/mobile-app/assets/icons/splash-icon.png` — same as `icon-foreground.png` (transparent; Expo paints `#222831` behind it)
- `apps/mobile-app/assets/icons/adaptive-icon.png` — **Android adaptive** foreground only (mark shrunk into the safe zone so round launchers do not clip it)
- `apps/mobile-app/assets/icons/kindred.icon` — iOS icon package

How to do this on the next job: studio `project-template/docs/client-delivery/app-icon-with-snapai.md`.
