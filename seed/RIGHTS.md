# Seed audio and image rights

The demo catalog uses forty music files and sixty images. This note is the list a store review can read. The same credit string is stored on each file in the database, so the app can show it on a track or artist page.

## Music

Each file is a track by Kevin MacLeod, downloaded from incompetech.com and licensed Creative Commons Attribution 4.0. The licence page is https://creativecommons.org/licenses/by/4.0/. Attribution required by that licence is the credit string in `seed/manifest.json`: the track title, Kevin MacLeod, incompetech.com, and the licence link.

The files in `seed/assets/audio` are those downloads re-encoded to 96 kbps MP3, trimmed to about 75 seconds, with album art stripped. Re-encoding is allowed by this licence. It keeps forty tracks at about 34 MB. Each encoded file is about one minute fifteen seconds. The source page for every file is the MP3 address on incompetech.com, stored as `sourceUrl` in the manifest. To rebuild or shrink again: `yarn seed:shrink` (from existing files) or delete `seed/assets/audio` and run `yarn seed:assets`.

The fictional Kindred artists and track titles are ours. They are not the names of the underlying recordings. "Asase" is our title. The audio under it is still credited to Kevin MacLeod.

## Images

All sixty images are Unsplash License photographs. That licence allows this portfolio and demo use. The credit string is `Photo: [name] / Unsplash`. The source page is the Unsplash photo address in the manifest.

Twelve portraits, twelve concert covers, and thirty-six release images (records, microphones, headphones, and a few more concert photos). The photographer for each file is named in `seed/manifest.json` and stored on the file row. The list of photo pages used to download them is `seed/image-sources.json`, plus the five portraits already chosen for onboarding (Prince Akachi and Ayo Ogunseinde). Unsplash+ photos were not used.

## Storage budget

Counted on 25 Sep 2026 after the KIND-89 shrink (75s @ 96 kbps, no embedded art):

- Audio: 34.4 MB for the forty MP3 files.
- Images: ~5 MB for the sixty photographs.
- Together: about 40 MB, well under the previous ~140 MB catalog and the Free file-storage allowance.

Convex's free plan includes 1 GB of file storage and 0.5 GB of database storage. This seed uses a small fraction of the file allowance. The waveform peaks live on the track rows (about 4 MB of numbers), inside the database allowance. A short listening demo still sends bytes out of Convex as **file data egress** (1 GB/month per team). Smaller clips mean each play costs less. Check usage with `npx convex deployment usage`. Ops guide: `docs/convex-usage.md`.
