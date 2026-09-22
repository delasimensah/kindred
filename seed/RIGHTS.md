# Seed audio and image rights

The demo catalog uses forty music files and sixty images. This note is the list a store review can read. The same credit string is stored on each file in the database, so the app can show it on a track or artist page.

## Music

Each file is a track by Kevin MacLeod, downloaded from incompetech.com and licensed Creative Commons Attribution 4.0. The licence page is https://creativecommons.org/licenses/by/4.0/. Attribution required by that licence is the credit string in `seed/manifest.json`: the track title, Kevin MacLeod, incompetech.com, and the licence link.

The files in `seed/assets/audio` are those downloads re-encoded to 128 kbps MP3. Re-encoding is allowed by this licence. It keeps forty tracks at about 135 MB instead of the larger originals. Each encoded file runs between 2 minutes 53 seconds and 4 minutes 9 seconds. The source page for every file is the MP3 address on incompetech.com, stored as `sourceUrl` in the manifest.

The fictional Kindred artists and track titles are ours. They are not the names of the underlying recordings. "Asase" is our title. The audio under it is still credited to Kevin MacLeod.

## Images

All sixty images are Unsplash License photographs. That licence allows this portfolio and demo use. The credit string is `Photo: [name] / Unsplash`. The source page is the Unsplash photo address in the manifest.

Twelve portraits, twelve concert covers, and thirty-six release images (records, microphones, headphones, and a few more concert photos). The photographer for each file is named in `seed/manifest.json` and stored on the file row. The list of photo pages used to download them is `seed/image-sources.json`, plus the five portraits already chosen for onboarding (Prince Akachi and Ayo Ogunseinde). Unsplash+ photos were not used.

## Storage budget

Counted on 22 Sep 2026 after encoding and the photo swap:

- Audio: 134.6 MB for the forty MP3 files.
- Images: 5.4 MB for the sixty photographs.
- Together: 140.0 MB, under the 200 MB catalog budget.

Convex's free plan includes 1 GB of file storage and 0.5 GB of database storage. This seed uses a fraction of the file allowance. The waveform peaks live on the track rows (about 4 MB of numbers), inside the database allowance. A short listening demo sends a few megabytes out of Convex. The free plan includes 1 GB of that outbound traffic per month. The dashboard usage page is https://dashboard.convex.dev/t/dm-studios/kindred/outstanding-cassowary-795 if the number needs a check before a later re-seed.
